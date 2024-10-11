import { sqliteTable, text, integer,  } from "drizzle-orm/sqlite-core";
import { title } from "process";


export const userTable = sqliteTable("user", {
	id: text("id").notNull().primaryKey(),
	username: text("username").notNull().unique(),
	googleId: text("google_id").unique(),
	email: text("email").notNull().unique(),
	firstName: text("first_name"),
	lastName: text("last_name"),
	createdAt: integer("created_at").notNull(),
	updatedAt: integer("updated_at").notNull(),
	conversationsCount: integer("conversations_count").notNull().default(0)
});

export const sessionTable = sqliteTable("session", {
	id: text("id").notNull().primaryKey(),  
	userId: text("user_id")
		.notNull()
		.references(() => userTable.id),
	expiresAt: integer("expires_at").notNull()
});

export const conversationsTable = sqliteTable("conversions", {
	id: text("id").notNull().primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => userTable.id),
	title: text("title").notNull(),
	conversation: text("conversation").notNull(),
	createdAt: integer("created_at").notNull(),
	updatedAt: integer("updated_at").notNull()
});