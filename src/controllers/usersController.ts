import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export async function listUsers(req: Request, res: Response): Promise<void> {
	const users = await prisma.user.findMany({
		select: { id: true, email: true, name: true, createdAt: true },
	});
	res.json(users);
}

export async function createUser(req: Request, res: Response): Promise<void> {
	const { email, name } = req.body as { email?: string; name?: string };
	if (!email) {
		res.status(400).json({ error: "email is required" });
		return;
	}
	const user = await prisma.user.create({ data: { email, name: name ?? null } });
	res.status(201).json(user);
}

