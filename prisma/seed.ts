import { PrismaClient } from "@prisma/client";

const DEFAULT_CATEGORIES = [
  { id: "cat-food", name: "Food", color: "#f97316", icon: "🍔" },
  { id: "cat-transport", name: "Transport", color: "#3b82f6", icon: "🚗" },
  { id: "cat-shopping", name: "Shopping", color: "#a855f7", icon: "🛍️" },
  { id: "cat-salary", name: "Salary", color: "#22c55e", icon: "💰" },
  { id: "cat-entertainment", name: "Entertainment", color: "#ec4899", icon: "🎬" },
  { id: "cat-bills", name: "Bills", color: "#ef4444", icon: "📄" },
  { id: "cat-health", name: "Health", color: "#14b8a6", icon: "🏥" },
  { id: "cat-education", name: "Education", color: "#6366f1", icon: "📚" },
  { id: "cat-others", name: "Others", color: "#6b7280", icon: "📦" },
];

async function main() {
  const prisma = new PrismaClient();

  // Seed requires a user — seed default categories for all existing users
  const users = await prisma.user.findMany();

  for (const user of users) {
    for (const cat of DEFAULT_CATEGORIES) {
      await prisma.category.upsert({
        where: { id: `${cat.id}-${user.id}` },
        update: { ...cat, id: `${cat.id}-${user.id}`, userId: user.id },
        create: { ...cat, id: `${cat.id}-${user.id}`, userId: user.id },
      });
    }

    await prisma.settings.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, theme: "system", currency: "৳" },
    });

    console.log(`Seeded defaults for user: ${user.email}`);
  }

  if (users.length === 0) {
    console.log("No users found — skipping seed. Register a user first.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
