import { generateIdFromEntropySize } from "lucia";
import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, "/login");
	}
	return {
		username: event.locals.user.username,
		firstName: event.locals.user.firstName,
		lastName: event.locals.user.lastName,
		email: event.locals.user.email,
		conversationsCount: event.locals.user.conversationsCount
    };
};

export const actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const prompt = formData.get("prompt")||null;
		const db = drizzle(event.platform?.env.DB as D1Database, {schema});
		
		if (
			typeof prompt !== "string" ||
			prompt.length < 2
		) {
			return fail(400, {
				message: "Invalid email"
			});
		}

		const conversationId = generateIdFromEntropySize(6)
		const conversation = JSON.stringify([{role: "user", content: prompt}]);
	
		try {
			await db.insert(schema.conversationsTable).values({
				id: conversationId,
				userId: event.locals.user.id,
				title: prompt.slice(10),
				conversation: conversation,
				createdAt: Date.now(),
				updatedAt: Date.now()
			});
			const body = {
				prompt: prompt,
				conversationId: conversationId
			}
			await event.platform?.env.aichatkv.put(event.locals.session?.id as string, conversation, { expirationTtl: 60*15} );
			const response = await event.fetch("./api/generate", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body)
			}).then(()=>console.log("done"));
			//@ts-ignore
			if (!response.ok) {
				return fail(500, {
					message: "Internal server error"
				});
			}
		} catch (e) {
			console.error(e);
			return fail(500, {
				message: "Internal server error"
			});
		}

		return redirect(302, "/chat/"+conversationId);

	}
};