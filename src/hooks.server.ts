import { initiateLucia } from "$lib/server/auth";
import type { Handle } from "@sveltejs/kit";
import { verifyRequestOrigin } from "lucia";

export const handle: Handle = async ({ event, resolve }) => {
	if (event.request.method !== "GET") {
		const originHeader = event.request.headers.get("Origin");
		const hostHeader = event.request.headers.get("Host");
		if (
			!originHeader ||
			!hostHeader ||
			!verifyRequestOrigin(originHeader, [hostHeader])
		) {
			return new Response(null, {
			status: 403,
			});
		}
	}


    const lucia = initiateLucia(event.platform?.env.DB as D1Database);
	const sessionId = event.cookies.get(lucia.sessionCookieName);
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await lucia.validateSession(sessionId);
	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		// sveltekit types deviates from the de-facto standard
		// you can use 'as any' too
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes
		});
	}
	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes
		});
	}
	event.locals.user = user;
	event.locals.session = session;
	return resolve(event);
};
