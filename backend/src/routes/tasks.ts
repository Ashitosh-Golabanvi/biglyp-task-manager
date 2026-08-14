import { Hono } from "hono";
import {
	and,
	desc,
	eq,
	like,
	lt,
	sql,
} from "drizzle-orm";
import { z } from "zod";
import { createDb } from "../db";
import { tasks } from "../db/schema";
import { authMiddleware } from "../middleware/auth";

const tasksRouter = new Hono();

tasksRouter.use("*", authMiddleware);

const dueDateSchema = z
	.string()
	.optional()
	.refine(
		(value) => {
			if (!value) {
				return true;
			}

			return !Number.isNaN(Date.parse(value));
		},
		{
			message: "Invalid due date",
		},
	);

const createTaskSchema = z.object({
	title: z.string().trim().min(1, "Title is required"),
	description: z.string().optional(),
	status: z
		.enum(["todo", "in-progress", "done"])
		.optional(),
	dueDate: dueDateSchema,
});

const updateTaskSchema = z.object({
	title: z.string().min(1).max(200).optional(),

	description: z
		.string()
		.max(5000)
		.nullable()
		.optional(),

	status: z
		.enum([
			"todo",
			"in-progress",
			"done",
		])
		.optional(),

	dueDate: z
		.string()
		.datetime()
		.nullable()
		.optional(),
});

tasksRouter.post("/", async (c) => {
	const body = await c.req.json();

	const result = createTaskSchema.safeParse(body);

	if (!result.success) {
		return c.json(
			{
				error: "Validation failed",
				details: result.error.flatten(),
			},
			400,
		);
	}

	const userId = c.get("userId");

	const db = createDb(c.env.task_manager_db);

	const now = new Date();

	const dueDate = result.data.dueDate
		? new Date(result.data.dueDate)
		: null;

	const [createdTask] = await db
		.insert(tasks)
		.values({
			id: crypto.randomUUID(),
			title: result.data.title,
			description: result.data.description ?? null,
			status: result.data.status ?? "todo",
			userId,
			dueDate,
			createdAt: now,
			updatedAt: now,
		})
		.returning();

	return c.json(
		{
			task: createdTask,
		},
		201,
	);
});

tasksRouter.get("/", async (c) => {
	const userId = c.get("userId");

	const pageParam = c.req.query("page");
	const pageSizeParam = c.req.query("pageSize");

	const page = pageParam ? Number(pageParam) : 1;
	const pageSize = pageSizeParam ? Number(pageSizeParam) : 10;

	if (
		!Number.isInteger(page) ||
		page < 1 ||
		!Number.isInteger(pageSize) ||
		pageSize < 1 ||
		pageSize > 100
	) {
		return c.json(
			{
				error: "Invalid pagination parameters",
			},
			400,
		);
	}

	const offset = (page - 1) * pageSize;

	const status = c.req.query("status");
	const search = c.req.query("search");
	const dueBefore = c.req.query("dueBefore");

	const statusSchema = z.enum([
		"todo",
		"in-progress",
		"done",
	]);

	if (status) {
		const statusResult = statusSchema.safeParse(status);

		if (!statusResult.success) {
			return c.json(
				{
					error: "Invalid status",
				},
				400,
			);
		}
	}

	if (dueBefore && Number.isNaN(Date.parse(dueBefore))) {
		return c.json(
			{
				error: "Invalid dueBefore date",
			},
			400,
		);
	}

	const dueBeforeDate = dueBefore
		? new Date(dueBefore)
		: null;

	const db = createDb(c.env.task_manager_db);

	const conditions = [
		eq(tasks.userId, userId),
	];

	if (status) {
		conditions.push(
			eq(
				tasks.status,
				status as "todo" | "in-progress" | "done",
			),
		);
	}

	if (search) {
		conditions.push(
			like(tasks.title, `%${search}%`),
		);
	}

	if (dueBeforeDate) {
		conditions.push(
			lt(tasks.dueDate, dueBeforeDate),
		);
	}

	const whereCondition = and(...conditions);

	const taskList = await db
		.select()
		.from(tasks)
		.where(whereCondition)
		.orderBy(desc(tasks.createdAt))
		.limit(pageSize)
		.offset(offset);

	const [{ count }] = await db
		.select({
			count: sql<number>`count(*)`,
		})
		.from(tasks)
		.where(whereCondition);

	const total = Number(count);

	const totalPages = Math.ceil(
		total / pageSize,
	);

	return c.json({
		page,
		pageSize,
		total,
		totalPages,
		tasks: taskList,
	});
});

tasksRouter.get("/:id", async (c) => {
	const taskId = c.req.param("id");
	const userId = c.get("userId");

	const db = createDb(c.env.task_manager_db);

	const [task] = await db
		.select()
		.from(tasks)
		.where(
			and(
				eq(tasks.id, taskId),
				eq(tasks.userId, userId),
			),
		)
		.limit(1);

	if (!task) {
		return c.json(
			{
				error: "Task not found",
			},
			404,
		);
	}

	return c.json({
		task,
	});
});

tasksRouter.put("/:id", async (c) => {
	const taskId = c.req.param("id");
	const userId = c.get("userId");

	const body = await c.req.json();

	const result = updateTaskSchema.safeParse(body);

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

	const [existingTask] = await db
		.select()
		.from(tasks)
		.where(
			and(
				eq(tasks.id, taskId),
				eq(tasks.userId, userId),
			),
		)
		.limit(1);

	if (!existingTask) {
		return c.json(
			{
				error: "Task not found",
			},
			404,
		);
	}

	const updateData: {
		updatedAt: Date;
		title?: string;
		description?: string | null;
		status?: "todo" | "in-progress" | "done";
		dueDate?: Date | null;
	} = {
		updatedAt: new Date(),
	};

	if (result.data.title !== undefined) {
		updateData.title = result.data.title;
	}

	if (result.data.description !== undefined) {
		updateData.description = result.data.description;
	}

	if (result.data.status !== undefined) {
		updateData.status = result.data.status;
	}

	if (result.data.dueDate !== undefined) {
		updateData.dueDate = result.data.dueDate
			? new Date(result.data.dueDate)
			: null;
	}

	const [updatedTask] = await db
		.update(tasks)
		.set(updateData)
		.where(
			and(
				eq(tasks.id, taskId),
				eq(tasks.userId, userId),
			),
		)
		.returning();

	return c.json({
		task: updatedTask,
	});
});

tasksRouter.delete("/:id", async (c) => {
	const taskId = c.req.param("id");
	const userId = c.get("userId");

	const db = createDb(c.env.task_manager_db);

	const [existingTask] = await db
		.select()
		.from(tasks)
		.where(
			and(
				eq(tasks.id, taskId),
				eq(tasks.userId, userId),
			),
		)
		.limit(1);

	if (!existingTask) {
		return c.json(
			{
				error: "Task not found",
			},
			404,
		);
	}

	await db
		.delete(tasks)
		.where(
			and(
				eq(tasks.id, taskId),
				eq(tasks.userId, userId),
			),
		);

	return c.json({
		message: "Task deleted successfully",
	});
});

export default tasksRouter;