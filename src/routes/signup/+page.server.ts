import { initiateLucia } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import { generateIdFromEntropySize } from "lucia";
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import * as schema from "../../db/schema";

import type { Actions } from "./$types";

export const actions: Actions = {
	default: async (event) => {
        const lucia = initiateLucia(event.platform?.env.DB as D1Database);
        const db = drizzle(event.platform?.env.DB as D1Database, { schema });
		const formData = await event.request.formData();
		const username = formData.get("username");
		const password = formData.get("password");
		// username must be between 4 ~ 31 characters, and only consists of lowercase letters, 0-9, -, and _
		// keep in mind some database (e.g. mysql) are case insensitive
		if (
			typeof username !== "string" ||
			username.length < 3 ||
			username.length > 31 ||
			!/^[a-z0-9_-]+$/.test(username)
		) {
			return fail(400, {
				message: "Invalid username"
			});
		}
		if (typeof password !== "string" || password.length < 6 || password.length > 255) {
			return fail(400, {
				message: "Invalid password"
			});
		}

		const userId = generateIdFromEntropySize(10); // 16 characters long
		const passwordHash = await bcrypt.hash(password, 10);

		// TODO: check if username is already used
		const existingUser = await db.query.userTable.findFirst(
			{
				where: eq(schema.userTable.username, username)
			}
		);
		if (existingUser) {
			return fail(400, {
				message: "Username already exists"
			});
		}

		await db.insert(schema.userTable).values({
            id: userId,
            username: username,
            password_hash: passwordHash
        }
        )

		const session = await lucia.createSession(userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes
		});
		redirect(302, "/");
	}
};