import { initiateLucia } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import {drizzle} from "drizzle-orm/d1";
import * as schema from "../../db/schema";
import { generateIdFromEntropySize } from "lucia";
import {sendVerificationEmail} from "$lib/emailing/sib";

import type { Actions, PageServerLoad } from "./$types";
import { dev } from "$app/environment";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, "/");
	}
	return {
		key: event.platform?.env.SMTP_API_KEY
	};
};

export const actions: Actions = {
	default: async (event) => {
        const lucia = initiateLucia(event.platform?.env.DB as D1Database);
        const db = drizzle(event.platform?.env.DB as D1Database, {schema});

		const formData = await event.request.formData();
		const email = formData.get("email");
		const code = formData.get("code");
		const rectify = formData.get("rectify");

		if (rectify && Date.now()-parseInt(rectify as string) < 600000){
			return {
				codeSent: true,
				rectify: rectify
			}	
		}

		if (
			typeof email !== "string" ||
			email.length < 3 ||
			email.length > 256 ||
			email.includes("@") === false ||
			!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
		) {
			return fail(400, {
				message: "Invalid email"
			});
		}

		const existingUser = await db.query.userTable.findFirst({
			where: eq(schema.userTable.email, email)
		}) as App.Locals["user"] | null;
	
		const name = existingUser?.firstName ?? email.split("@")[0];
		
		if (code) {
			if (typeof code !== "string" || code.length !== 6 || !/^\d{6}$/.test(code)) {
				return fail(400, {
					message: "Invalid code"
				});
			}
			if ( code == await event.platform?.env.sveltkit_elysia.get(email) ) {
				const existingUser = await db.query.userTable.findFirst({
					where: eq(schema.userTable.email, email)
				})
				const userId = existingUser?.id ?? generateIdFromEntropySize(6);
				if ( !existingUser ) {
					// create user
					const username = email.split("@")[0]+generateIdFromEntropySize(2);
					await db.insert(schema.userTable).values({
						id: userId,
						username: username,
						email: email,
						createdAt: Date.now(),
						updatedAt: Date.now()
					});
				}

				const session = await lucia.createSession(userId, {});
				const sessionCookie = lucia.createSessionCookie(session.id);
				event.cookies.set(sessionCookie.name, sessionCookie.value, {
					path: ".",
					...sessionCookie.attributes
				});
				return redirect(302, "/");				
			} else {
				return fail(400, {
					message: "Invalid code"
				});
			}
		}

		try {
		//generate code
		const code = Math.floor(100000 + Math.random() * 900000).toString();
		await event.platform?.env.sveltkit_elysia.put(email, code, { expirationTtl: 600 }); // 10 minutes
		//send email
		if (!dev) {
			console.log("code", code);
			console.log("email not send in dev environement");
			return {
				codeSent: true,
				rectify: Date.now()
			}
		}
		await sendVerificationEmail(name, email, code, event.platform?.env.SMTP_API_KEY as string);
		return {
			codeSent: true,

		}
		} catch (e) {
			return fail(500, {
				message: "Failed to send verification email"
			});
		}
	}
};