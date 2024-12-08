import { Router } from "express";
import { authMiddleware } from "../middleware";
import { ZapCreateSchema } from "../types";
import { prismaClient } from "../db";

const router = Router();
//@ts-ignore
router.post("/", authMiddleware, async (req, res) => {
  // @ts-ignore
  const id: string = req.id;
  const body = req.body;
  const parsedData = ZapCreateSchema.safeParse(body);

  if (!parsedData.success) {
    return res.status(411).json({
      message: "Incorrect inputs",
    });
  }

  const zapId = await prismaClient.$transaction(async (tx) => {
    const zap = await prismaClient.zap.create({
      data: {
        userId: id,
        triggerId: "",
        actions: {
          create: parsedData.data.actions.map((x, index) => ({
            actionId: x.availableActionId,
            sortingOrder: index,
            metadata: x.actionMetadata,
          })),
        },
      },
    });

    const trigger = await tx.trigger.create({
      data: {
        triggerId: parsedData.data.availableTriggerId,
        zapId: zap.id,
        metadata: parsedData.data.triggerMetadata,
      },
    });

    await tx.zap.update({
      where: {
        id: zap.id,
      },
      data: {
        triggerId: trigger.id,
      },
    });

    return zap.id;
  });
  return res.json({
    zapId,
  });
});

//@ts-ignore
router.get("/", authMiddleware, async (req, res) => {
  // @ts-ignore
  const id = req.id;
  const zaps = await prismaClient.zap.findMany({
    where: {
      userId: id,
    },
    include: {
      actions: {
        include: {
          type: true,
        },
      },
      trigger: {
        include: {
          type: true,
        },
      },
    },
  });

  return res.json({
    zaps,
  });
});
//@ts-ignore
router.get("/:zapId", authMiddleware, async (req, res) => {
  const id = req.id;
  const zapId = req.params.zapId;
  console.log("ID", id);
  const zap = await prismaClient.zap.findFirst({
    where: {
      id: zapId,
      userId: id,
    },
    include: {
      actions: {
        include: {
          type: true,
        },
      },
      trigger: {
        include: {
          type: true,
        },
      },
    },
  });

  return res.json({
    zap,
  });
});

export const zapRouter = router;