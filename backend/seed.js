import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@kasaglowclean.com',
      password: hashedPassword,
    },
  });
  console.log('✅ Admin user created:', admin.username);

  // Create services
  const services = [
    {
      name: 'Standard House Cleaning',
      description: 'Complete cleaning of your home including dusting, vacuuming, mopping, and bathroom cleaning',
      durationMinutes: 120,
      price: 99.99,
      active: true,
    },
    {
      name: 'Deep Cleaning',
      description: 'Thorough deep cleaning including baseboards, inside cabinets, appliances, and hard-to-reach areas',
      durationMinutes: 180,
      price: 149.99,
      active: true,
    },
    {
      name: 'Office Cleaning',
      description: 'Professional office cleaning including desks, conference rooms, kitchen areas, and restrooms',
      durationMinutes: 90,
      price: 79.99,
      active: true,
    },
    {
      name: 'Move-In/Out Cleaning',
      description: 'Comprehensive cleaning for moving in or out, ensuring the space is spotless',
      durationMinutes: 240,
      price: 199.99,
      active: true,
    },
    {
      name: 'Post-Construction Cleaning',
      description: 'Specialized cleaning after renovation or construction work, including dust and debris removal',
      durationMinutes: 300,
      price: 249.99,
      active: true,
    },
    {
      name: 'Carpet & Upholstery Cleaning',
      description: 'Professional steam cleaning for carpets, sofas, and other upholstered furniture',
      durationMinutes: 120,
      price: 129.99,
      active: true,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: {},
      create: service,
    });
  }
  console.log('✅ Services created:', services.length);

  // Create time slots (Monday-Friday 8AM-6PM, Saturday 9AM-5PM)
  const timeSlots = [
    // Monday-Friday
    { dayOfWeek: 1, startTime: '08:00', endTime: '18:00', isAvailable: true },
    { dayOfWeek: 2, startTime: '08:00', endTime: '18:00', isAvailable: true },
    { dayOfWeek: 3, startTime: '08:00', endTime: '18:00', isAvailable: true },
    { dayOfWeek: 4, startTime: '08:00', endTime: '18:00', isAvailable: true },
    { dayOfWeek: 5, startTime: '08:00', endTime: '18:00', isAvailable: true },
    // Saturday
    { dayOfWeek: 6, startTime: '09:00', endTime: '17:00', isAvailable: true },
  ];

  for (const slot of timeSlots) {
    await prisma.timeSlot.create({
      data: slot,
    });
  }
  console.log('✅ Time slots created:', timeSlots.length);

  console.log('🎉 Database seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
