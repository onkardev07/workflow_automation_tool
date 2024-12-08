import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    await prisma.availableAction.deleteMany();
    await prisma.availableTrigger.deleteMany();
    await prisma.user.deleteMany();
    console.log("Database cleared successfully.");
  } catch (error) {
    console.error("Error clearing database:", error);
  }
}

async function seedDatabase() {
  try {
    // Seed available triggers
    await prisma.availableTrigger.create({
      data: {
        id: "webhook",
        name: "Webhook",
        image:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIovxkR9l-OlwpjTXV1B4YNh0W_s618ijxAQ&s",
      },
    });

    // Seed available actions
    await prisma.availableAction.createMany({
      data: [
        {
          id: "sms",
          name: "Send SMS",
          image:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYpo6sTXcoxkrofI5seCvR9lb_Fd6m51INVA&s",
        },
        {
          id: "email",
          name: "Send Email",
          image:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4nd82eFk5SaBPRIeCpmwL7A4YSokA-kXSmw&s",
        },
      ],
    });

    console.log("Database seeded successfully.");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

async function main() {
  await clearDatabase(); // Step 1: Clear database
  await seedDatabase(); // Step 2: Seed new data
}

main()
  .catch((error) => {
    console.error("Error in main script:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
