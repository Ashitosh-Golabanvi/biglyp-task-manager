import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { createDb } from "../../db";
import { users } from "../../db/schema";
import { authMiddleware } from "../../middleware/auth";

const me = new Hono();

me.use("*", authMiddleware);

me.get("/", async (c) => {
	const userId = c.get("userId");

	const db = createDb(c.env.task_manager_db);

	const [user] = await db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			createdAt: users.createdAt,
		})
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	if (!user) {
		return c.json(
			{
				error: "User not found",
			},
			404,
		);
	}

	return c.json({
		user,
	});
});

export default me;