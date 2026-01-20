import { faker } from '@faker-js/faker';
import {
  CustomerType,
  OrderStatus,
  PaymentMethod,
  PrismaClient,
  UserRole,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CONFIG = {
  CUSTOMERS_COUNT: 100,
  PAST_DAYS: 10,
};

async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

function getRandomDeliveryDays(): number[] {
  const DAYS = [1, 2, 3, 4, 5, 6]; // Mon–Sat
  const count = faker.number.int({ min: 1, max: 4 }); // 1–4 days/week
  return faker.helpers.arrayElements(DAYS, count);
}


async function main() {
  console.log('🌱 Starting seed...');

  // ================= CLEANUP =================
  // Delete dependent records first to avoid foreign key violations
  await prisma.auditLog.deleteMany();
  await prisma.customerProductPrice.deleteMany();
  await prisma.customerBottleWallet.deleteMany();
  await prisma.ledger.deleteMany();
  await prisma.driverLedger.deleteMany();
  await prisma.driverLocationHistory.deleteMany();
  await prisma.driverPerformanceMetrics.deleteMany();
  await prisma.cashHandover.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.routeAssignment.deleteMany();

  // Then delete main operational data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.driverProfile.deleteMany();
  await prisma.route.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // ================= USERS =================
  const password = await hashPassword('12345678');

  await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@blueice.com',
      phoneNumber: '03000000000',
      password,
      role: UserRole.ADMIN,
    },
  });

  // ================= DRIVERS (5 ONLY) =================
  const drivers = [];

  for (let i = 0; i < 5; i++) {
    const driver = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: `driver${i}@blueice.com`,
        phoneNumber: `030000000${i + 1}`,
        password,
        role: UserRole.DRIVER,
        driverProfile: {
          create: {
            vehicleNo: faker.vehicle.vrm(),
            licenseNo: faker.string.alphanumeric(8).toUpperCase(),
            isOnDuty: true,
          },
        },
      },
      include: { driverProfile: true },
    });
    drivers.push(driver);
  }

  // ================= PRODUCTS =================
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: '19L Water',
        sku: 'W-19L',
        basePrice: 80,
        isReturnable: true,
        stockFilled: 500,
        stockEmpty: 100,
      },
    }),
    prisma.product.create({
      data: {
        name: '12L Water',
        sku: 'W-12L',
        basePrice: 150,
        isReturnable: true,
        stockFilled: 300,
        stockEmpty: 50,
      },
    }),
  ]);

  // ================= ROUTES =================
  const routeNames = ['DHA', 'Clifton', 'Gulshan', 'Nazimabad'];

  const routes = [];
  for (const name of routeNames) {
    routes.push(
      await prisma.route.create({
        data: {
          name,
          description: `Route for ${name}`,
          defaultDriverId:
            drivers[Math.floor(Math.random() * drivers.length)].driverProfile
              ?.id,
        },
      }),
    );
  }

  const defaultProduct = products[0]; // 19L Water

  // ================= CUSTOMERS (100 ONLY) =================
  const customers = [];

  for (let i = 0; i < CONFIG.CUSTOMERS_COUNT; i++) {
    const route = faker.helpers.arrayElement(routes);
    const phone = faker.string.numeric(11);
    const deliveryDays = getRandomDeliveryDays();
    const defaultQty = faker.number.int({ min: 1, max: 3 });


    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        phoneNumber: `03${phone.substring(2)}`,
        email: faker.internet.email(),
        password,
        role: UserRole.CUSTOMER,
        customerProfile: {
          create: {
            manualCode: `L-${(i + 1).toString().padStart(4, '0')}`,
            type: faker.helpers.arrayElement(Object.values(CustomerType)),
            address: faker.location.streetAddress(),
            area: route.name,
            routeId: route.id,
            creditLimit: 5000,
            cashBalance: 0,
            deliveryDays,
            defaultProductId: defaultProduct.id,
            defaultQuantity: defaultQty,
          },
        },
      },
      include: { customerProfile: true },
    });

    if (user.customerProfile) customers.push(user.customerProfile);
  }

  // ================= ORDERS (LAST 10 DAYS) =================
  /*
  const today = new Date();

  for (let d = CONFIG.PAST_DAYS; d >= 1; d--) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);

    for (let i = 0; i < 10; i++) {
      const customer = faker.helpers.arrayElement(customers);
      const driver = faker.helpers.arrayElement(drivers);
      const product = products[0];
      const qty = faker.number.int({ min: 1, max: 3 });

      await prisma.order.create({
        data: {
          customerId: customer.id,
          driverId: driver.driverProfile?.id,
          scheduledDate: date,
          deliveredAt: date,
          status: OrderStatus.COMPLETED,
          totalAmount: qty * Number(product.basePrice),
          paymentMethod: PaymentMethod.CASH,
          cashCollected: qty * Number(product.basePrice),
          orderItems: {
            create: {
              productId: product.id,
              quantity: qty,
              priceAtTime: product.basePrice,
              filledGiven: qty,
              emptyTaken: qty,
            },
          },
        },
      });
    }
  }
  */

  console.log('✅ Seed completed');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
