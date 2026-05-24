import bcrypt from "bcrypt";
import '../src/config/env.js';
import { prisma } from '../src/config/db.js';

console.log("SEED STARTED");

const seed = async () => {
  try {
    console.log("Seeding started...");

    // =========================
    // 1. CLEAN DATABASE (OPTIONAL)
    // =========================
    await prisma.billItem.deleteMany();
    await prisma.bill.deleteMany();
    await prisma.inventoryLog.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.member.deleteMany();
    await prisma.staff.deleteMany();

    // =========================
    // 2. STAFF (ADMIN + STAFF)
    // =========================
    const hashedPassword = await bcrypt.hash("password123", 10);

    const admin = await prisma.staff.create({
      data: {
        fullName: "System Admin",
        email: "admin@smartmart.com",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    const staff1 = await prisma.staff.create({
      data: {
        fullName: "Cashier One",
        email: "cashier1@smartmart.com",
        password: hashedPassword,
        role: "STAFF",
      },
    });

    const staff2 = await prisma.staff.create({
      data: {
        fullName: "Cashier Two",
        email: "cashier2@smartmart.com",
        password: hashedPassword,
        role: "STAFF",
      },
    });

    // =========================
    // 3. CATEGORIES
    // =========================
    const beverages = await prisma.category.create({
      data: { name: "Beverages" },
    });

    const groceries = await prisma.category.create({
      data: { name: "Groceries" },
    });

    // =========================
    // 4. PRODUCTS
    // =========================
    const rice = await prisma.product.create({
      data: {
        name: "Rice 25kg",
        sku: "RICE-001",
        buyingPrice: 1200,
        sellingPrice: 1500,
        stockQuantity: 100,
        categoryId: groceries.id,
      },
    });

    const coke = await prisma.product.create({
      data: {
        name: "Coca Cola 500ml",
        sku: "COKE-001",
        buyingPrice: 40,
        sellingPrice: 60,
        stockQuantity: 200,
        categoryId: beverages.id,
      },
    });

    const oil = await prisma.product.create({
      data: {
        name: "Sunflower Oil 1L",
        sku: "OIL-001",
        buyingPrice: 180,
        sellingPrice: 220,
        stockQuantity: 80,
        categoryId: groceries.id,
      },
    });

    // =========================
    // 5. MEMBERS
    // =========================
    const member1 = await prisma.member.create({
      data: {
        membershipId: "MEM-1001",
        fullName: "Subesh Sharma",
        phoneNumber: "9800000001",
        loyaltyPoints: 50,
      },
    });

    const member2 = await prisma.member.create({
      data: {
        membershipId: "MEM-1002",
        fullName: "Aarav Karki",
        phoneNumber: "9800000002",
        loyaltyPoints: 120,
      },
    });

    // =========================
    // 6. BILL 1
    // =========================
    const bill1 = await prisma.bill.create({
      data: {
        billNumber: "BILL-001",
        createdById: staff1.id,
        memberId: member1.id,
        subtotal: 1760,
        totalDiscount: 60,
        finalAmount: 1700,
        paymentMethod: "CASH",
        billItems: {
          create: [
            {
              productId: rice.id,
              quantity: 1,
              productPrice: 1500,
              totalPrice: 1500,
            },
            {
              productId: coke.id,
              quantity: 4,
              productPrice: 60,
              totalPrice: 240,
            },
          ],
        },
      },
    });

    // =========================
    // 7. BILL 2
    // =========================
    const bill2 = await prisma.bill.create({
      data: {
        billNumber: "BILL-002",
        createdById: staff2.id,
        memberId: member2.id,
        subtotal: 2200,
        totalDiscount: 100,
        finalAmount: 2100,
        paymentMethod: "CARD",
        billItems: {
          create: [
            {
              productId: oil.id,
              quantity: 5,
              productPrice: 220,
              totalPrice: 1100,
            },
            {
              productId: rice.id,
              quantity: 1,
              productPrice: 1500,
              totalPrice: 1500,
            },
          ],
        },
      },
    });

    // =========================
    // 8. INVENTORY LOGS
    // =========================
    await prisma.inventoryLog.createMany({
      data: [
        {
          productId: rice.id,
          updatedById: admin.id,
          previousStock: 100,
          newStock: 99,
          changeAmount: -1,
          reason: "Sold in BILL-001",
        },
        {
          productId: coke.id,
          updatedById: staff1.id,
          previousStock: 200,
          newStock: 196,
          changeAmount: -4,
          reason: "Sold in BILL-001",
        },
        {
          productId: oil.id,
          updatedById: staff2.id,
          previousStock: 80,
          newStock: 75,
          changeAmount: -5,
          reason: "Sold in BILL-002",
        },
      ],
    });

    console.log("Seeding completed successfully");
  } catch (error) {
    console.error("Seed error:", error);
  } finally {
    await prisma.$disconnect();
  }
};

seed();