import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seed() {
  // Seed 100 employees
  for (let i = 0; i < 100; i++) {
    const username = faker.internet.username();
    const password = await bcrypt.hash('password123', 10);
    const salary = faker.number.float({ min: 10000000, max: 15000000, fractionDigits: 0 });
    await prisma.employee.create({
      data: {
        username,
        password,
        salary,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  // Seed 1 admin
  const adminUsername = 'admin';
  const adminPassword = await bcrypt.hash('adminpass', 10);
  await prisma.admin.create({
    data: {
      username: adminUsername,
      password: adminPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('Seeding completed.');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });