import { drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import type { PageServerLoad, Actions } from "./$types";
import { redirect,fail,  } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
    if (!event.locals.user) {
        return redirect(302, "/login");
    }
    const conversationId = event.params.slugs;
    const db = drizzle(event.platform?.env.DB as D1Database, {schema});
    const conversation = await db.query.conversationsTable.findFirst(
        {
            where: eq(schema.conversationsTable.id, conversationId)
        }
    );
    if (!conversation) {
        return redirect(302, "/");
    }
    return {
        conversation: conversation.conversation,
        username: event.locals.user.username,
        firstName: event.locals.user.firstName,
        lastName: event.locals.user.lastName,
        email: event.locals.user.email,
        conversationsCount: event.locals.user.conversationsCount
    }
}


        