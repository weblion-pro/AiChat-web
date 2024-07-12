import { Elysia } from "elysia";
import type { Context } from "elysia";
import { swagger } from '@elysiajs/swagger'
import { initiateLucia } from "$lib/server/auth";

interface CF extends Context {
    platform: App.Platform;
    locals: App.Locals;
}

const app = new Elysia({ aot: false, prefix: "/api" }).use(swagger());

app.post("/logout", async (c:CF) => {
    if (!c.locals.session) {
        return new Response(null, {
            status: 401,
        });
    }
    const lucia = initiateLucia(c.platform.env.DB as D1Database);
    await lucia.invalidateSession(c.locals.session.id);
    const sessionCookie = lucia.createBlankSessionCookie();
    c.cookie.sessionCookie.set(sessionCookie)
    return new Response(null, {
        status: 200,
    });
})

type RequestHandler = (v: { request: Request, platform: App.Platform, locals:App.Locals }) => Response | Promise<Response>

export const GET: RequestHandler = ({ request, platform, locals }) => app.decorate({platform, locals}).handle(request)
export const POST: RequestHandler = ({ request, platform, locals }) => app.decorate({platform, locals}).handle(request)
export const PUT: RequestHandler = ({ request, platform, locals }) => app.decorate({platform, locals}).handle(request)
export const DELETE: RequestHandler = ({ request, platform, locals }) => app.decorate({platform, locals}).handle(request)
export const PATCH: RequestHandler = ({ request, platform, locals }) => app.decorate({platform, locals}).handle(request)
export const OPTIONS: RequestHandler = ({ request, platform, locals }) => app.decorate({platform, locals}).handle(request)
export const HEAD: RequestHandler = ({ request, platform, locals }) => app.decorate({platform, locals}).handle(request)

