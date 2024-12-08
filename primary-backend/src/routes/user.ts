import { Router } from "express";

import { prismaClient } from "../db";
import jwt from "jsonwebtoken";
import { SigninSchema, SignupSchema } from "../types";
import { JWT_PASSWORD } from "../config";
import { authMiddleware } from "../middleware";

const router = Router();

router.post("/signup", async (req: any, res: any) => {
  const body = req.body;
  const parsedData = SignupSchema.safeParse(body);

  if (!parsedData.success) {
    console.log(parsedData.error);
    return res.status(411).json({
      message: "Incorrect inputs",
    });
  }

  const userExists = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data.email,
    },
  });

  if (userExists) {
    return res.status(403).json({
      message: "User already exists",
    });
  }

  await prismaClient.user.create({
    data: {
      username: parsedData.data.username,
      // TODO: Dont store passwords in plaintext, hash it
      password: parsedData.data.password,
      email: parsedData.data.email,
    },
  });

  // await sendEmail();

  return res.json({
    message: "Please verify your account by checking your email",
  });
});

router.post("/signin", async (req: any, res: any) => {
  const body = req.body;
  const parsedData = SigninSchema.safeParse(body);

  if (!parsedData.success) {
    return res.status(411).json({
      message: "Incorrect inputs",
    });
  }

  const user = await prismaClient.user.findFirst({
    where: {
      username: parsedData.data.username,
      password: parsedData.data.password,
    },
  });

  if (!user) {
    return res.status(403).json({
      message: "Sorry credentials are incorrect",
    });
  }

  // sign the jwt
  const token = jwt.sign(
    {
      id: user.id,
    },
    JWT_PASSWORD
  );

  res.json({
    token: token,
  });
});

router.get("/", authMiddleware, async (req: any, res: any) => {
  // TODO: Fix the type
  // @ts-ignore
  const id = req.id;
  const user = await prismaClient.user.findFirst({
    where: {
      id,
    },
    select: {
      username: true,
      email: true,
    },
  });

  return res.json({
    user,
  });
});

export const userRouter = router;
