// import { PrismaClient } from "@prisma/client";
// import { Kafka } from "kafkajs";

// const prismaClient = new PrismaClient();
// const TOPIC_NAME = "zap-events";

// const kafka = new Kafka({
//   clientId: "outbox-processor-2",
//   brokers: ["localhost:9092"],
// });

// async function main() {
//   const consumer = kafka.consumer({ groupId: "main-worker-2" });
//   await consumer.connect();

//   await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true });

//   await consumer.run({
//     autoCommit: false,
//     eachMessage: async ({ topic, partition, message }) => {
//       console.log({
//         partition,
//         offset: message.offset,
//         value: message.value?.toString(),
//       });
//       await new Promise((r) => setTimeout(r, 5000));
//       console.log("processing done");
//       //
//       await consumer.commitOffsets([
//         {
//           topic: TOPIC_NAME,
//           partition: partition,
//           offset: (parseInt(message.offset) + 1).toString(), // 5
//         },
//       ]);
//     },
//   });
// }

// main();

// require("dotenv").config();

import { PrismaClient } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";
import { Kafka } from "kafkajs";
import { parse } from "./parser";
import { sendEmail } from "./email";
import { sendNotification } from "./sms";

const prismaClient = new PrismaClient();
const TOPIC_NAME = "zap-events";

const kafka = new Kafka({
  clientId: "outbox-processor-2",
  brokers: ["localhost:9092"],
});

async function main() {
  const consumer = kafka.consumer({ groupId: "main-worker-2" });
  await consumer.connect();
  const producer = kafka.producer();
  await producer.connect();

  await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true });

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        partition,
        offset: message.offset,
        value: message.value?.toString(),
      });
      if (!message.value?.toString()) {
        return;
      }

      const parsedValue = JSON.parse(message.value?.toString());
      const zapRunId = parsedValue.zapRunId;
      const stage = parsedValue.stage;

      const zapRunDetails = await prismaClient.zapRun.findFirst({
        where: {
          id: zapRunId,
        },
        include: {
          zap: {
            include: {
              actions: {
                include: {
                  type: true,
                },
              },
            },
          },
        },
      });
      const currentAction = zapRunDetails?.zap.actions.find(
        (x) => x.sortingOrder === stage
      );

      if (!currentAction) {
        console.log("Current action not found?");
        return;
      }

      const zapRunMetadata = zapRunDetails?.metadata;

      if (currentAction.type.id === "email") {
        const body = parse(
          (currentAction.metadata as JsonObject)?.body as string,
          zapRunMetadata
        );
        const to = parse(
          (currentAction.metadata as JsonObject)?.email as string,
          zapRunMetadata
        );
        console.log(`Sending out email to ${to} body is ${body}`);
        console.log("Email sent", to, body);
        await sendEmail(to, body);
      }

      if (currentAction.type.id === "sms") {
        const mobile = parse(
          (currentAction.metadata as JsonObject)?.mobile as string,
          zapRunMetadata
        );
        const msg = parse(
          (currentAction.metadata as JsonObject)?.message as string,
          zapRunMetadata
        );
        console.log(`Sending out SMS with data ${msg} to address ${mobile}`);

        await sendNotification({ phoneNumber: mobile, message: msg });
      }

      await new Promise((r) => setTimeout(r, 500));

      const lastStage = (zapRunDetails?.zap.actions?.length || 1) - 1; // 1
      console.log(lastStage);
      console.log(stage);
      if (lastStage !== stage) {
        console.log("pushing back to the queue");
        await producer.send({
          topic: TOPIC_NAME,
          messages: [
            {
              value: JSON.stringify({
                stage: stage + 1,
                zapRunId,
              }),
            },
          ],
        });
      }

      console.log("processing done");
      //
      await consumer.commitOffsets([
        {
          topic: TOPIC_NAME,
          partition: partition,
          offset: (parseInt(message.offset) + 1).toString(), // 5
        },
      ]);
    },
  });
}

main();
