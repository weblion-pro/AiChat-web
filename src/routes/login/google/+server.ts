import { redirect, json } from "@sveltejs/kit";
import { generateState, generateCodeVerifier } from "arctic";
import { initiateGoogleAuthClient } from "$lib/server/auth";
import { dev } from "$app/environment";

import type { RequestEvent } from "@sveltejs/kit";

export async function GET(event: RequestEvent): Promise<Response> {
    //console.log("origin "+event.url.origin+"/login/google/callback")
    const google = initiateGoogleAuthClient(
        event.platform?.env.GOOGLE_CLIENT_ID as string,
        event.platform?.env.GOOGLE_CLIENT_SECRET as string,
        event.url.origin + "/login/google/callback"
    );
	const state = generateState();
    const codeVerifier = generateCodeVerifier();
    
	const url = await google.createAuthorizationURL(state, codeVerifier,
		{
			scopes: ["openid", "email", "profile"],
		}
	 );

	event.cookies.set("google_oauth_state", state, {
		path: "/",
		secure: !dev, 
		httpOnly: true,
		maxAge: 60 * 10,
	});

    event.cookies.set("google_oauth_codeVerifier", codeVerifier, {
		path: "/",
		secure: !dev,
		httpOnly: true,
		maxAge: 60 * 10,
	});

	redirect(302, url.toString());
}