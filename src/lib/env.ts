import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv();

const envSchema = z.object({
	DATABASE_URL: z.string().url(),
	PORT: z
		.string()
		.regex(/^\d+$/)
		.default("3000"),
	NODE_ENV: z
		.enum(["development", "test", "production"]).default("development"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
	console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
	process.exit(1);
}

export const env: { DATABASE_URL: string; PORT: number; NODE_ENV: "development" | "test" | "production" } = {
	...parsed.data,
	PORT: Number(parsed.data.PORT),
};

