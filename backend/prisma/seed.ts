import { PrismaClient, Gender, GoalType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function run() {
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: { email: 'demo@example.com', passwordHash },
  });

  await prisma.profile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      age: 30,
      gender: Gender.MALE,
      heightCm: 178,
      weightKg: 78,
      activityLevel: 1.4,
      goal: GoalType.MAINTAIN,
      dietaryPreferences: ['balanced'],
      allergies: ['peanuts'],
      dailyCalorieTarget: 2300,
      proteinTargetGrams: 140,
      carbsTargetGrams: 260,
      fatsTargetGrams: 70,
    },
  });

  console.log('Seeded demo user');
}

run().finally(async () => {
  await prisma.$disconnect();
});

