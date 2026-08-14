import { Hono } from "hono";
import { cors } from "hono/cors";

import health from "./routes/health";
import auth from "./routes/auth";
import tasksRouter from "./routes/tasks";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: [
      "http://localhost:3000",
      "https://localhost:3000",
    ],
    allowMethods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS",
    ],
    allowHeaders: [
      "Content-Type",
      "Authorization",
    ],
  }),
);

app.route("/api/health", health);
app.route("/api/auth", auth);
app.route("/api/tasks", tasksRouter);

app.notFound((c) => {
  return c.json(
    {
      error: "Not Found",
    },
    404,
  );
});

app.onError((err, c) => {
  console.error(err);

  return c.json(
    {
      error: "Internal Server Error",
    },
    500,
  );
});

export default app;