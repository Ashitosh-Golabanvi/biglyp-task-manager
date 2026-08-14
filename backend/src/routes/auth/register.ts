import { Hono } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createDb } from "../../db";
import { users } from "../../db/schema";

const auth = new Hono();

const registerSchema = z.object({
	name: z.string().trim().min(1, "Name is required"),
	email: z.string().trim().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

auth.post("/", async (c) => {
	const body = await c.req.json();

	const result = registerSchema.safeParse(body);

	if (!result.success) {
		return c.json(
			{
				error: "Validation failed",
				details: result.error.flatten(),
			},
			400,
		);
	}

	const db = createDb(c.env.task_manager_db);

	const existingUser = await db
		.select({
			id: users.id,
		})
		.from(users)
		.where(eq(users.email, result.data.email))
		.limit(1);

	if (existingUser.length > 0) {
		return c.json(
			{
				error: "Email already registered",
			},
			409,
		);
	}

	const passwordHash = await bcrypt.hash(result.data.password, 10);

	const [createdUser] = await db
		.insert(users)
		.values({
			id: crypto.randomUUID(),
			name: result.data.name,
			email: result.data.email,
			password: passwordHash,
			createdAt: new Date(),
		})
		.returning({
			id: users.id,
			name: users.name,
			email: users.email,
			createdAt: users.createdAt,
		});

	return c.json(
		{
			user: createdUser,
		},
		201,
	);
});

export default auth;