import { Lucia, TimeSpan, type RegisteredDatabaseUserAttributes } from "lucia";
import { DrizzleSQLiteAdapter  } from "@lucia-auth/adapter-drizzle";
import { drizzle } from "drizzle-orm/d1";
import { dev } from "$app/environment";
import * as schema from "../../db/schema";
import { userInfo } from "os";
import { USERNAME } from "$env/static/private";

interface ExtendedUserAttributes {
    id: string;
    username: string;
    firstName: string;
}

export function initiateLucia(D1: D1Database) {
    const db = drizzle(D1, {schema});
    const adapter = new DrizzleSQLiteAdapter (db, schema.sessionTable, schema.userTable);
    return new Lucia(
        adapter,
        {
            sessionExpiresIn: new TimeSpan(60, "d"),
            sessionCookie: {
                attributes: {
                    // set to `true` when using HTTPS
                    secure: !dev
                }
            },
            getUserAttributes: (attributes) => {
                return {
                    // attributes has the type of DatabaseUserAttributes
                    id: attributes.id,
                    username: attributes.username,
                    firstName: attributes.firstName,
                    lastName: attributes.lastName,
                    email: attributes.email
                };
            }
        }
    )
}


declare module "lucia" {
	interface Register {
		Lucia: typeof initiateLucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface DatabaseUserAttributes {
    id: string;
	username: string;
    firstName: string;
    lastName: string;
    email: string;
}
