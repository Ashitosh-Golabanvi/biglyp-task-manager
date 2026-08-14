import { Hono } from "hono";
import register from "./register";
import login from "./login";
import me from "./me";

const auth = new Hono();

auth.route("/register", register);
auth.route("/login", login);
auth.route("/me", me);

export default auth;