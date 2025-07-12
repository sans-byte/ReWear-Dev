import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@rewear.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@rewear.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      points: 1000,
    },
  });

  // Create test users
  const userPassword = await bcrypt.hash('password123', 10);
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'alice@example.com' },
      update: {},
      create: {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        passwordHash: userPassword,
        points: 150,
      },
    }),
    prisma.user.upsert({
      where: { email: 'bob@example.com' },
      update: {},
      create: {
        name: 'Bob Smith',
        email: 'bob@example.com',
        passwordHash: userPassword,
        points: 200,
      },
    }),
    prisma.user.upsert({
      where: { email: 'carol@example.com' },
      update: {},
      create: {
        name: 'Carol Davis',
        email: 'carol@example.com',
        passwordHash: userPassword,
        points: 120,
      },
    }),
  ]);

  // Sample items
  const sampleItems = [
    {
      title: 'Vintage Denim Jacket',
      description: 'Classic blue denim jacket in excellent condition. Perfect for layering.',
      images: ['https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg'],
      category: 'OUTERWEAR',
      size: 'M',
      condition: 'GOOD',
      tags: ['vintage', 'denim', 'casual'],
      uploaderId: users[0].id,
    },
    {
      title: 'Black Evening Dress',
      description: 'Elegant black dress perfect for formal occasions. Worn only once.',
      images: ['https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg'],
      category: 'FORMAL',
      size: 'S',
      condition: 'LIKE_NEW',
      tags: ['formal', 'elegant', 'evening'],
      uploaderId: users[1].id,
    },
    {
      title: 'Comfort Running Shoes',
      description: 'High-quality running shoes with excellent cushioning. Barely used.',
      images: ['https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg'],
      category: 'SHOES',
      size: '9',
      condition: 'LIKE_NEW',
      tags: ['athletic', 'running', 'comfortable'],
      uploaderId: users[2].id,
    },
    {
      title: 'Wool Sweater',
      description: 'Cozy wool sweater in cream color. Perfect for winter.',
      images: ['https://images.pexels.com/photos/5710082/pexels-photo-5710082.jpeg'],
      category: 'TOPS',
      size: 'L',
      condition: 'GOOD',
      tags: ['wool', 'winter', 'cozy'],
      uploaderId: users[0].id,
    },
    {
      title: 'High-Waist Jeans',
      description: 'Trendy high-waist jeans in dark blue. Great fit and comfortable.',
      images: ['https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg'],
      category: 'BOTTOMS',
      size: 'M',
      condition: 'GOOD',
      tags: ['jeans', 'high-waist', 'trendy'],
      uploaderId: users[1].id,
    },
    {
      title: 'Leather Handbag',
      description: 'Genuine leather handbag with multiple compartments. Classic design.',
      images: ['https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg'],
      category: 'ACCESSORIES',
      size: 'One Size',
      condition: 'GOOD',
      tags: ['leather', 'handbag', 'classic'],
      uploaderId: users[2].id,
    },
  ];

  for (const itemData of sampleItems) {
    await prisma.item.create({
      data: itemData,
    });
  }

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });