import { Hono } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { createDb } from "../../db";
import { users } from "../../db/schema";

const login = new Hono();

const loginSchema = z.object({
	email: z.string().trim().email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});

login.post("/", async (c) => {
	const body = await c.req.json();

	const result = loginSchema.safeParse(body);

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

	const [user] = await db
		.select()
		.from(users)
		.where(eq(users.email, result.data.email))
		.limit(1);

	if (!user) {
		return c.json(
			{
				error: "Invalid email or password",
			},
			401,
		);
	}

	const passwordValid = await bcrypt.compare(
		result.data.password,
		user.password,
	);

	if (!passwordValid) {
		return c.json(
			{
				error: "Invalid email or password",
			},
			401,
		);
	}

	if (!c.env.JWT_SECRET) {
		console.error("JWT_SECRET is not configured");

		return c.json(
			{
				error: "Server configuration error",
			},
			500,
		);
	}

	const secret = new TextEncoder().encode(c.env.JWT_SECRET);

	const token = await new SignJWT({
		name: user.name,
		email: user.email,
	})
		.setProtectedHeader({
			alg: "HS256",
		})
		.setSubject(user.id)
		.setIssuedAt()
		.setExpirationTime("24h")
		.sign(secret);

	return c.json({
		token,
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			createdAt: user.createdAt,
		},
	});
});

export default login;