import { createMiddleware } from "hono/factory";
import { jwtVerify } from "jose";

type AuthVariables = {
	userId: string;
};

export const authMiddleware = createMiddleware<{
	Variables: AuthVariables;
}>(async (c, next) => {
	const authorization = c.req.header("Authorization");

	if (!authorization) {
		return c.json(
			{
				error: "Authorization header required",
			},
			401,
		);
	}

	const [scheme, token] = authorization.split(" ");

	if (scheme !== "Bearer" || !token) {
		return c.json(
			{
				error: "Invalid authorization header",
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

	try {
		const secret = new TextEncoder().encode(c.env.JWT_SECRET);

		const { payload } = await jwtVerify(token, secret);

		const userId = payload.sub;

		if (!userId) {
			return c.json(
				{
					error: "Invalid token",
				},
				401,
			);
		}

		c.set("userId", userId);

		await next();
	} catch (error) {
		console.error("JWT verification failed:", error);

		return c.json(
			{
				error: "Invalid or expired token",
			},
			401,
		);
	}
});