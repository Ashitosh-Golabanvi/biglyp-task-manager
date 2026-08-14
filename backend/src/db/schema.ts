import { sql } from "drizzle-orm";
import {
	check,
	integer,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	password: text("password").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const tasks = sqliteTable(
	"tasks",
	{
		id: text("id").primaryKey(),
		title: text("title").notNull(),
		description: text("description"),
		status: text("status").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id),
		dueDate: integer("due_date", { mode: "timestamp" }),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	},
	(table) => ({
		statusCheck: check(
			"status_check",
			sql`${table.status} IN ('todo', 'in-progress', 'done')`,
		),
	}),
);