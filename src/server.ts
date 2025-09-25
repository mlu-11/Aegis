import express from "express";
import { env } from "./lib/env.js";
import healthRouter from "./routes/health.js";
import usersRouter from "./routes/users.js";

const app = express();

app.use(express.json());

app.use("/health", healthRouter);
app.use("/users", usersRouter);

app.use((req, res) => {
	res.status(404).json({ error: "Not found" });
});

const port = env.PORT;
app.listen(port, () => {
	console.log(`Server listening on http://localhost:${port}`);
});

