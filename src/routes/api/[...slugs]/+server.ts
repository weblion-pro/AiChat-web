import { Elysia } from 'elysia';
import type { Context } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { initiateLucia } from '$lib/server/auth';
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import { eq } from "drizzle-orm";
import { redirect } from '@sveltejs/kit';
import { generateIdFromEntropySize } from 'lucia';

interface CF extends Context {
	platform: App.Platform;
	locals: App.Locals;
	body: {
		prompt: string;
		conversationId: string;
	};
}

interface AiResponse {
	response: string;
}
interface AiImageResponse {
	image: string;
}

const app = new Elysia({ aot: false, prefix: '/api' }).use(swagger());

app.post('/logout', async (c: CF) => {
	if (!c.locals.session) {
		return new Response(null, {
			status: 401
		});
	}
	const lucia = initiateLucia(c.platform.env.DB as D1Database);
	await lucia.invalidateSession(c.locals.session.id);
	const sessionCookie = lucia.createBlankSessionCookie();
	c.cookie.sessionCookie.set(sessionCookie);
	return new Response(null, {
		status: 200
	});
});

app.post( '/generate', async (c: CF) => {
		if (!c.locals.user) {
			return new Response(null, {
				status: 401
			});
		}
		const db = drizzle(c.platform.env.DB as D1Database, {schema});
		const prompt = c.body.prompt
		let tbc = false
		const conversationId = c.body.conversationId ?? (tbc = true, generateIdFromEntropySize(6));
		//proofing
		if (typeof prompt !== 'string' || prompt.length < 1 || prompt.length > 131072) {
			return new Response(null, {
				status: 403
			});
		}

		try {
			let messages = [] as {role: string, content: string}[];
			if (tbc) {
				await db.insert(schema.conversationsTable).values({
					id: conversationId,
					userId: c.locals.user.id,
					title: prompt.slice(10),
					conversation: JSON.stringify([{role: "user", content: prompt}]),
					createdAt: Date.now(),
					updatedAt: Date.now()
				});
			} else {
				const conversation = await db.query.conversationsTable.findFirst(
					{
						where: eq(schema.conversationsTable.id, conversationId)
					}
				);

				if (!conversation) {
					return redirect(302, "/api/logout");
				}
				messages = JSON.parse(conversation.conversation);
			}
			const fullPrompt = [...messages, {role: "user", content: prompt}];
			//@ts-ignore
			const response = await c.platform.env.AI.run("@cf/meta/llama-3.2-11b-vision-instruct", {
				max_tokens: 2048,
				messages: fullPrompt,
			}) as AiResponse;



			await db.update(schema.conversationsTable).set({
				conversation: JSON.stringify([...fullPrompt, {role: "assistant", content: response.response}]),
				updatedAt: Date.now()
			}).where(
				eq(schema.conversationsTable.id, conversationId)
			)

			const output = tbc? {conversationId, response: response.response}: { response : response.response};

			return new Response(JSON.stringify(output), {
				status: 200,
				headers: {
					'Content-Type': 'application/json'
				}
			});
		} catch (e) {
			console.error(e);
			return new Response(null, {
				status: 500
			});
		}
	}
);

app.post("/generateImage", async (c: CF) => {
	if (!c.locals.user) {
		return new Response("Not An Authenticated user", {
			status: 403
		});
	}
	const prompt = c.body.prompt
	try {
		//@ts-ignore
		const response = await c.platform.env.AI.run("@cf/black-forest-labs/flux-1-schnell", {
			prompt: prompt,
		}) as AiImageResponse;

		return new Response(response.image, {
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
	catch (e) {
		console.error(e);
		return new Response(null, {
			status: 500
		});
	}
});



type RequestHandler = (v: {
	request: Request;
	platform: App.Platform;
	locals: App.Locals;
}) => Response | Promise<Response>;

export const GET: RequestHandler = ({ request, platform, locals }) =>
	app.decorate({ platform, locals }).handle(request);
export const POST: RequestHandler = ({ request, platform, locals }) =>
	app.decorate({ platform, locals }).handle(request);
export const PUT: RequestHandler = ({ request, platform, locals }) =>
	app.decorate({ platform, locals }).handle(request);
export const DELETE: RequestHandler = ({ request, platform, locals }) =>
	app.decorate({ platform, locals }).handle(request);
export const PATCH: RequestHandler = ({ request, platform, locals }) =>
	app.decorate({ platform, locals }).handle(request);
export const OPTIONS: RequestHandler = ({ request, platform, locals }) =>
	app.decorate({ platform, locals }).handle(request);
export const HEAD: RequestHandler = ({ request, platform, locals }) =>
	app.decorate({ platform, locals }).handle(request);
