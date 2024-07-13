import { generateIdFromEntropySize } from "lucia";
import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
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
		secretVar: event.platform?.env.SMTP_API_KEY
    };
};

export const actions = {
	default: async (event) => {
		const db = drizzle(event.platform?.env.DB as D1Database, {schema});
		const formData = await event.request.formData();
		const email = formData.get("email");
		const username = formData.get("username");
		const firstName = formData.get("firstName");
		const lastName = formData.get("lastName");

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

		if (
			typeof username !== "string" ||
			username.length < 3 ||
			username.length > 30 ||
			!/^[a-zA-Z0-9._-]+$/.test(username)
		) {
			return fail(400, {
				message: "Invalid username"
			});
		}

		if (
			typeof firstName !== "string" ||
			firstName.length < 3 ||
			firstName.length > 30 ||
			!/^[a-zA-Z]+$/.test(firstName)
		) {
			return fail(400, {
				message: "Invalid first name"
			});
		}

		if (
			typeof lastName !== "string" ||
			lastName.length < 3 ||
			lastName.length > 30

		) {
			return fail(400, {
				message: "Invalid last name"
			});
		}

		await db.update(schema.userTable).set({
			username,
			firstName,
			lastName,
			email,
			updatedAt: Date.now()
		}).where(
			eq(schema.userTable.id, event.locals.user.id)
		);

		return redirect(302, "/");

	}
};