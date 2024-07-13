import { fail, redirect, type ServerLoadEvent } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import {drizzle, DrizzleD1Database} from "drizzle-orm/d1";
import * as schema from "../../../../db/schema";
import { OAuth2RequestError } from "arctic";
import { generateIdFromEntropySize, Lucia, type User } from "lucia";
import { initiateLucia, initiateGoogleAuthClient, type DatabaseUserAttributes } from "$lib/server/auth";

import type { PageServerLoad, PageServerLoadEvent, Actions } from "./$types";

interface GoogleUser {
    sub: string,
    name: string,
    given_name: string,
    family_name: string,
    picture: string,
    email: string,
    email_verified: boolean
}


export const load: PageServerLoad = async (event) => {
	const state = event.url.searchParams.get("state");
    const code = event.url.searchParams.get("code");
    const storedState = event.cookies.get("google_oauth_state");
    const storedCodeVerifier = event.cookies.get("google_oauth_codeVerifier");
    
    const lucia = initiateLucia(event.platform?.env.DB as D1Database);
    const db = drizzle(event.platform?.env.DB as D1Database, {schema});
    const google = initiateGoogleAuthClient(
        event.platform?.env.GOOGLE_CLIENT_ID as string,
        event.platform?.env.GOOGLE_CLIENT_SECRET as string,
        event.url.origin + "/login/google/callback"
    );
    

    if (!state || !code || !storedState || !storedCodeVerifier) {
        return {
            error: "Invalid request"
        };
    }
    if (state !== storedState) {
        return {
            error: "Invalid state"
        };
    }

    try {

        const authRes = await google.validateAuthorizationCode(code, storedCodeVerifier);

        const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
            headers: {
                Authorization: `Bearer ${authRes.accessToken}`
            }
        });
        const user: GoogleUser = await response.json();

        if (!user) {
            return {
                error: "Google user not found"
            };
        }

        if (!user.email_verified) {
            return {
                error: "Email not verified at Google"
            }
        }

        const existingUser = await db.query.userTable.findFirst({
            where: eq(schema.userTable.googleId, parseInt(user.sub))
        })
        
        if (existingUser) {
            await checkName(db, existingUser as DatabaseUserAttributes, user);
            await createSessionCookie(event, lucia, existingUser.id);
            
            return {
                username: user.given_name?? existingUser.username
            }
        }
        
        const emailUserExists = await db.query.userTable.findFirst({
            where: eq(schema.userTable.email, user.email)
        });

        if (emailUserExists) {
            await db.update(schema.userTable).set({
                googleId: parseInt(user.sub),
                updatedAt: Date.now()
            }).where(eq(schema.userTable.email, user.email));
            await checkName(db, emailUserExists as DatabaseUserAttributes, user);
            await createSessionCookie(event, lucia, emailUserExists.id);
            return {
                username: user.given_name?? emailUserExists.username
            }
        }

        const username = user.email.split("@")[0] + generateIdFromEntropySize(2);
        await db.insert(schema.userTable).values({
            id: generateIdFromEntropySize(10),
            username: username,
            googleId: parseInt(user.sub),
            email: user.email,
            firstName: user.given_name,
            lastName: user.family_name,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
        return {
            username: user.given_name?? username
        }



    } catch (e:any) {
        console.error(e);
        if (e instanceof OAuth2RequestError) {
            return {
                error: e.description
            };
        }
        return {
            error: e.message?? "An error occurred"
        }
    }
}

async function createSessionCookie( event:PageServerLoadEvent , lucia: Lucia , id: string) {
    const session = await lucia.createSession(id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
        path: ".",
        ...sessionCookie.attributes
    });
}

async function checkName( db: DrizzleD1Database<typeof schema>, existingUser: DatabaseUserAttributes ,user: GoogleUser) {
    if (existingUser.lastName == "" && !existingUser.lastName) {
        await db.update(schema.userTable).set({
            lastName: user.family_name
        }).where(eq(schema.userTable.id, existingUser.id));
        return true
    }
    if (existingUser.firstName == "" && !existingUser.firstName) {
        await db.update(schema.userTable).set({
            firstName: user.given_name
        }).where(eq(schema.userTable.id, existingUser.id));
        return true
    }
}