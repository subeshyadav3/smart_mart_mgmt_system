import '../src/config/env.js';
import prisma from '../src/config/db.js';
import { PrismaClient, Role, ProductStatus, BillStatus, PaymentMethod } from '@prisma/client'
import { hashPassword } from '../src/utils/password.js';

// ─── Helpers ────────────────────────────────────────────────────────────────
function daysAgo(number){
  const d = new Date()
  d.setDate(d.getDate() - number)
  return d
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Seeding database...')

  try {
    // ── Cleanup (order matters – children first) ──────────────────────────────
    console.log('🗑️  Clearing existing data...')
    await prisma.billItem.deleteMany()
    await prisma.bill.deleteMany()
    await prisma.inventoryLog.deleteMany()
    await prisma.product.deleteMany()
    await prisma.category.deleteMany()
    await prisma.member.deleteMany()
    await prisma.staff.deleteMany()
    console.log('✅ Cleared existing data')

    // ── Passwords ─────────────────────────────────────────────────────────────
    console.log('🔐 Hashing passwords...')
    const adminPwd = await hashPassword('Admin@123')
    const staffPwd = await hashPassword('Staff@123')
    console.log('✅ Passwords hashed')

  // ═══════════════════════════════════════════════════════════════════════════
  // STAFF  (2 Admins + 6 Staff)
  // ═══════════════════════════════════════════════════════════════════════════
  const staffData = [
    // -- Admins ---------------------------------------------------------------
    {
      fullName: 'Aarav Sharma',
      email: 'aarav.sharma@shopease.com',
      password: adminPwd,
      phoneNumber: '9841100001',
      role: Role.ADMIN,
      isActive: true,
      createdAt: daysAgo(365),
    },
    {
      fullName: 'Priya Thapa',
      email: 'priya.thapa@shopease.com',
      password: adminPwd,
      phoneNumber: '9841100002',
      role: Role.ADMIN,
      isActive: true,
      createdAt: daysAgo(300),
    },
    // -- Staff ----------------------------------------------------------------
    {
      fullName: 'Bikash Karki',
      email: 'bikash.karki@shopease.com',
      password: staffPwd,
      phoneNumber: '9841200001',
      role: Role.STAFF,
      isActive: true,
      createdAt: daysAgo(250),
    },
    {
      fullName: 'Sita Rai',
      email: 'sita.rai@shopease.com',
      password: staffPwd,
      phoneNumber: '9841200002',
      role: Role.STAFF,
      isActive: true,
      createdAt: daysAgo(220),
    },
    {
      fullName: 'Dipesh Gurung',
      email: 'dipesh.gurung@shopease.com',
      password: staffPwd,
      phoneNumber: '9841200003',
      role: Role.STAFF,
      isActive: true,
      createdAt: daysAgo(180),
    },
    {
      fullName: 'Anita Bhandari',
      email: 'anita.bhandari@shopease.com',
      password: staffPwd,
      phoneNumber: '9841200004',
      role: Role.STAFF,
      isActive: true,
      createdAt: daysAgo(150),
    },
    {
      fullName: 'Roshan Adhikari',
      email: 'roshan.adhikari@shopease.com',
      password: staffPwd,
      phoneNumber: '9841200005',
      role: Role.STAFF,
      isActive: false,   // resigned
      createdAt: daysAgo(120),
    },
    {
      fullName: 'Manisha Shrestha',
      email: '',
      password: staffPwd,
      phoneNumber: '9841200006',
      role: Role.STAFF,
      isActive: true,
      createdAt: daysAgo(60),
    },
  ]

  const staffRecords = await Promise.all(
    staffData.map(d => prisma.staff.create({ data: d }))
  )
  console.log(`✅ Created ${staffRecords.length} staff members`)
  
  if (staffRecords.length === 0) {
    throw new Error('No staff records created!')
  }

  const [admin1, admin2, staff1, staff2, staff3, staff4, , staff6] = staffRecords

  // ═══════════════════════════════════════════════════════════════════════════
  // MEMBERS  (10 loyalty members)
  // ═══════════════════════════════════════════════════════════════════════════
    console.log('👥 Creating members...')
    const memberPwd = await hashPassword('Member@123')
    
    const memberData = [
        { membershipId: 'MBR-TEST-0001', fullName: 'Test Member',     phoneNumber: '9801000999', password: memberPwd, loyaltyPoints: 100, totalSpent: 1000,   createdAt: daysAgo(30)  },
      { membershipId: 'MBR-2024-0001', fullName: 'Ramesh Hamal',     phoneNumber: '9801001001', password: memberPwd, loyaltyPoints: 3450, totalSpent: 34500,  createdAt: daysAgo(340) },
      { membershipId: 'MBR-2024-0002', fullName: 'Kamala Devi',      phoneNumber: '9801001002', password: memberPwd, loyaltyPoints: 1280, totalSpent: 12800,  createdAt: daysAgo(310) },
      { membershipId: 'MBR-2024-0003', fullName: 'Suresh Poudel',    phoneNumber: '9801001003', password: memberPwd, loyaltyPoints: 5670, totalSpent: 56700,  createdAt: daysAgo(280) },
    { membershipId: 'MBR-2024-0004', fullName: 'Gita Tamang',      phoneNumber: '9801001004', password: memberPwd, loyaltyPoints: 890,  totalSpent: 8900,   createdAt: daysAgo(260) },
    { membershipId: 'MBR-2024-0005', fullName: 'Naresh Basnet',    phoneNumber: '9801001005', password: memberPwd, loyaltyPoints: 2100, totalSpent: 21000,  createdAt: daysAgo(230) },
    { membershipId: 'MBR-2024-0006', fullName: 'Sunita Maharjan',  phoneNumber: '9801001006', password: memberPwd, loyaltyPoints: 760,  totalSpent: 7600,   createdAt: daysAgo(200) },
    { membershipId: 'MBR-2024-0007', fullName: 'Binod Chaudhary',  phoneNumber: '9801001007', password: memberPwd, loyaltyPoints: 4320, totalSpent: 43200,  createdAt: daysAgo(170) },
    { membershipId: 'MBR-2024-0008', fullName: 'Laxmi Magar',      phoneNumber: '9801001008', password: memberPwd, loyaltyPoints: 1950, totalSpent: 19500,  createdAt: daysAgo(140) },
    { membershipId: 'MBR-2024-0009', fullName: 'Prakash Limbu',    phoneNumber: '9801001009', password: memberPwd, loyaltyPoints: 320,  totalSpent: 3200,   createdAt: daysAgo(90)  },
    { membershipId: 'MBR-2024-0010', fullName: 'Menuka Acharya',   phoneNumber: '9801001010', password: memberPwd, loyaltyPoints: 610,  totalSpent: 6100,   createdAt: daysAgo(45)  },
  ]

  const memberRecords = await Promise.all(
    memberData.map(d => prisma.member.create({ data: { ...d, totalSpent: d.totalSpent } }))
  )
  console.log(`✅ Created ${memberRecords.length} members`)
  console.log('🧪 Default member test login: MBR-TEST-0001 / Member@123')

  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORIES  (8)
  // ═══════════════════════════════════════════════════════════════════════════
  const categoryData = [
    { name: 'Beverages',              description: 'Soft drinks, juices, water, energy drinks, and hot beverages' },
    { name: 'Snacks & Confectionery', description: 'Chips, chocolates, biscuits, candies, and instant noodles' },
    { name: 'Personal Care',          description: 'Soaps, shampoos, toothpaste, deodorants, and skincare products' },
    { name: 'Electronics & Accessories', description: 'Mobile accessories, batteries, cables, and small electronics' },
    { name: 'Dairy & Bakery',         description: 'Milk, butter, cheese, yogurt, bread, and eggs' },
    { name: 'Household Essentials',   description: 'Cleaning products, detergents, and home care items' },
    { name: 'Stationery & Office',    description: 'Notebooks, pens, staplers, and office supplies' },
    { name: 'Health & Wellness',      description: 'Vitamins, first-aid, OTC medicines, and health supplements' },
  ]

  const categoryRecords = await Promise.all(
    categoryData.map(d => prisma.category.create({ data: { ...d, createdAt: daysAgo(400) } }))
  )
  console.log(`✅ Created ${categoryRecords.length} categories`)

  const [catBev, catSnack, catCare, catElec, catDairy, catHouse, catStat, catHealth] = categoryRecords

  // ═══════════════════════════════════════════════════════════════════════════
  // PRODUCTS  (76 products)
  // ═══════════════════════════════════════════════════════════════════════════
  // Prices in NPR (Nepalese Rupees)
  // imageUrl: Unsplash source – replace with CDN URLs in production
  const productData = [
    // ── Beverages (14) ───────────────────────────────────────────────────────
    { name: 'Coca-Cola 500ml',           sku: 'BEV-001', barcode: '8901428800015', buyingPrice: 45,   sellingPrice: 65,   discountPercent: 0,  stockQuantity: 120, minimumStock: 20, categoryId: catBev.id, imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80', description: 'Classic Coca-Cola carbonated soft drink, 500ml PET bottle' },
    { name: 'Pepsi 500ml',               sku: 'BEV-002', barcode: '8901519111153', buyingPrice: 43,   sellingPrice: 62,   discountPercent: 0,  stockQuantity: 95,  minimumStock: 20, categoryId: catBev.id, imageUrl: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&q=80', description: 'Pepsi cola carbonated soft drink, 500ml PET bottle' },
    { name: 'Mountain Dew 500ml',        sku: 'BEV-003', barcode: '8901519111016', buyingPrice: 43,   sellingPrice: 62,   discountPercent: 0,  stockQuantity: 80,  minimumStock: 15, categoryId: catBev.id, imageUrl: 'https://images.unsplash.com/photo-1624517452488-04c3a3f33ccf?w=400&q=80', description: 'Mountain Dew citrus-flavored carbonated drink, 500ml' },
    { name: 'Sprite 500ml',              sku: 'BEV-004', barcode: '8901428800022', buyingPrice: 43,   sellingPrice: 62,   discountPercent: 0,  stockQuantity: 88,  minimumStock: 15, categoryId: catBev.id, imageUrl: 'https://images.unsplash.com/photo-1625772452859-1c03d884d6d5?w=400&q=80', description: 'Sprite lemon-lime carbonated soft drink, 500ml PET bottle' },
    { name: 'Red Bull Energy 250ml',     sku: 'BEV-005', barcode: '9002490100070', buyingPrice: 155,  sellingPrice: 210,  discountPercent: 0,  stockQuantity: 60,  minimumStock: 10, categoryId: catBev.id, imageUrl: 'https://images.unsplash.com/photo-1619788372926-14e45e46e7c1?w=400&q=80', description: 'Red Bull energy drink with taurine and caffeine, 250ml can' },
    { name: 'Monster Energy 500ml',      sku: 'BEV-006', barcode: '7026162001108', buyingPrice: 185,  sellingPrice: 260,  discountPercent: 5,  stockQuantity: 45,  minimumStock: 10, categoryId: catBev.id, imageUrl: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=400&q=80', description: 'Monster Energy original flavor, 500ml can' },
    { name: 'Real Mango Juice 200ml',    sku: 'BEV-007', barcode: '8906002320016', buyingPrice: 28,   sellingPrice: 42,   discountPercent: 0,  stockQuantity: 150, minimumStock: 30, categoryId: catBev.id, imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400&q=80', description: 'Real fruit power mango juice, 200ml Tetra Pack' },
    { name: 'Frooti Mango Drink 200ml',  sku: 'BEV-008', barcode: '8906001800127', buyingPrice: 22,   sellingPrice: 35,   discountPercent: 0,  stockQuantity: 130, minimumStock: 25, categoryId: catBev.id, imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80', description: 'Frooti mango fruit drink, 200ml Tetra Pack' },
    { name: 'Kinley Mineral Water 1L',   sku: 'BEV-009', barcode: '8901428101122', buyingPrice: 14,   sellingPrice: 25,   discountPercent: 0,  stockQuantity: 200, minimumStock: 50, categoryId: catBev.id, imageUrl: 'https://images.unsplash.com/photo-1564419320461-6870880221ad?w=400&q=80', description: 'Kinley purified drinking water, 1 litre PET bottle' },
    { name: 'Lipton Green Tea 25 Bags',  sku: 'BEV-010', barcode: '8718114958859', buyingPrice: 175,  sellingPrice: 250,  discountPercent: 0,  stockQuantity: 55,  minimumStock: 10, categoryId: catBev.id, imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80', description: 'Lipton pure green tea bags, box of 25' },
    { name: 'Wai Wai Quick Noodles',     sku: 'BEV-011', barcode: '9556001100107', buyingPrice: 12,   sellingPrice: 18,   discountPercent: 0,  stockQuantity: 300, minimumStock: 60, categoryId: catSnack.id, imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80', description: 'Wai Wai instant chicken flavour noodles, 75g' },
    { name: 'Sting Energy Drink 250ml',  sku: 'BEV-012', barcode: '8901519111474', buyingPrice: 38,   sellingPrice: 60,   discountPercent: 0,  stockQuantity: 90,  minimumStock: 20, categoryId: catBev.id, imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80', description: 'Sting strawberry-flavored energy drink, 250ml can' },
    { name: 'Nestea Iced Tea 500ml',     sku: 'BEV-013', barcode: '8901030705754', buyingPrice: 48,   sellingPrice: 70,   discountPercent: 0,  stockQuantity: 65,  minimumStock: 15, categoryId: catBev.id, imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80', description: 'Nestea lemon iced tea, 500ml PET bottle' },
    { name: 'Mirinda Orange 500ml',      sku: 'BEV-014', barcode: '8901519111283', buyingPrice: 43,   sellingPrice: 62,   discountPercent: 0,  stockQuantity: 72,  minimumStock: 15, categoryId: catBev.id, imageUrl: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=400&q=80', description: 'Mirinda orange carbonated soft drink, 500ml' },

    // ── Snacks & Confectionery (16) ───────────────────────────────────────────
    { name: "Lay's Classic Salted 26g",  sku: 'SNK-001', barcode: '8901519105718', buyingPrice: 20,   sellingPrice: 30,   discountPercent: 0,  stockQuantity: 180, minimumStock: 30, categoryId: catSnack.id, imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80', description: "Lay's classic salted potato chips, 26g pack" },
    { name: 'Kurkure Masala Munch 90g',  sku: 'SNK-002', barcode: '8901030686847', buyingPrice: 25,   sellingPrice: 38,   discountPercent: 0,  stockQuantity: 140, minimumStock: 25, categoryId: catSnack.id, imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80', description: 'Kurkure masala munch puffed corn snack, 90g' },
    { name: 'Pringles Original 165g',    sku: 'SNK-003', barcode: '5053990138654', buyingPrice: 185,  sellingPrice: 260,  discountPercent: 5,  stockQuantity: 50,  minimumStock: 10, categoryId: catSnack.id, imageUrl: 'https://images.unsplash.com/photo-1575556170484-6b0b1f5ec6e7?w=400&q=80', description: 'Pringles original flavour potato crisps, 165g canister' },
    { name: 'Oreo Original 133g',        sku: 'SNK-004', barcode: '7622201791674', buyingPrice: 42,   sellingPrice: 65,   discountPercent: 0,  stockQuantity: 120, minimumStock: 20, categoryId: catSnack.id, imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80', description: 'Oreo sandwich cookies with cream filling, 133g pack' },
    { name: 'Kit Kat 4-Finger 41.5g',   sku: 'SNK-005', barcode: '7613036937832', buyingPrice: 38,   sellingPrice: 60,   discountPercent: 0,  stockQuantity: 160, minimumStock: 30, categoryId: catSnack.id, imageUrl: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&q=80', description: 'Nestlé Kit Kat crispy wafer with milk chocolate, 41.5g' },
    { name: 'Snickers 50g',             sku: 'SNK-006', barcode: '4000539117206', buyingPrice: 52,   sellingPrice: 80,   discountPercent: 0,  stockQuantity: 110, minimumStock: 20, categoryId: catSnack.id, imageUrl: 'https://images.unsplash.com/photo-1527904324834-3bda86da6771?w=400&q=80', description: 'Snickers chocolate bar with peanuts, nougat and caramel, 50g' },
    { name: 'Cadbury Dairy Milk 40g',    sku: 'SNK-007', barcode: '7622201860288', buyingPrice: 48,   sellingPrice: 75,   discountPercent: 0,  stockQuantity: 145, minimumStock: 25, categoryId: catSnack.id, imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&q=80', description: 'Cadbury Dairy Milk milk chocolate bar, 40g' },
    { name: 'Maggi 2-Minute Noodles',    sku: 'SNK-008', barcode: '8901030698238', buyingPrice: 14,   sellingPrice: 22,   discountPercent: 0,  stockQuantity: 280, minimumStock: 60, categoryId: catSnack.id, imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80', description: 'Maggi 2-minute masala instant noodles, 70g pack' },
    { name: 'Bourbon Biscuit 150g',      sku: 'SNK-009', barcode: '8901016121501', buyingPrice: 28,   sellingPrice: 42,   discountPercent: 0,  stockQuantity: 100, minimumStock: 20, categoryId: catSnack.id, imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&q=80', description: 'Britannia Bourbon chocolate cream biscuits, 150g' },
    { name: 'Ferrero Rocher 16pc',       sku: 'SNK-010', barcode: '8000500014073', buyingPrice: 350,  sellingPrice: 500,  discountPercent: 5,  stockQuantity: 35,  minimumStock: 8,  categoryId: catSnack.id, imageUrl: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400&q=80', description: 'Ferrero Rocher premium hazelnut chocolate, 200g box (16 pcs)' },
    { name: 'Toblerone Milk 100g',       sku: 'SNK-011', barcode: '7622201647629', buyingPrice: 180,  sellingPrice: 265,  discountPercent: 0,  stockQuantity: 45,  minimumStock: 8,  categoryId: catSnack.id, imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80', description: 'Toblerone Swiss milk chocolate with honey & almond, 100g' },
    { name: 'Good Day Butter Cookies',   sku: 'SNK-012', barcode: '8901016055226', buyingPrice: 32,   sellingPrice: 50,   discountPercent: 0,  stockQuantity: 90,  minimumStock: 15, categoryId: catSnack.id, imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&q=80', description: 'Britannia Good Day cashew and butter cookies, 120g' },
    { name: "Lay's Masala 40g",          sku: 'SNK-013', barcode: '8901519105718', buyingPrice: 28,   sellingPrice: 42,   discountPercent: 0,  stockQuantity: 160, minimumStock: 30, categoryId: catSnack.id, imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80', description: "Lay's India's Magic Masala flavoured potato chips, 40g" },
    { name: 'Mentos Mint Roll 38g',      sku: 'SNK-014', barcode: '8410031902109', buyingPrice: 18,   sellingPrice: 28,   discountPercent: 0,  stockQuantity: 200, minimumStock: 40, categoryId: catSnack.id, imageUrl: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=400&q=80', description: 'Mentos fresh mint chewy candy roll, 38g' },
    { name: 'M&Ms Peanut 100g',          sku: 'SNK-015', barcode: '4002244011155', buyingPrice: 165,  sellingPrice: 240,  discountPercent: 0,  stockQuantity: 55,  minimumStock: 10, categoryId: catSnack.id, imageUrl: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=400&q=80', description: "M&M's peanut chocolate candies, 100g pack" },
    { name: 'Haldirams Namkeen 400g',    sku: 'SNK-016', barcode: '8906008660037', buyingPrice: 95,   sellingPrice: 145,  discountPercent: 0,  stockQuantity: 70,  minimumStock: 12, categoryId: catSnack.id, imageUrl: 'https://images.unsplash.com/photo-1606755456206-b25206cde6ee?w=400&q=80', description: "Haldiram's Aloo Bhujia salted snack mix, 400g pack" },

    // ── Personal Care (13) ────────────────────────────────────────────────────
    { name: 'Colgate Strong Teeth 200g', sku: 'CRE-001', barcode: '8901214000166', buyingPrice: 82,   sellingPrice: 125,  discountPercent: 0,  stockQuantity: 85,  minimumStock: 15, categoryId: catCare.id, imageUrl: 'https://images.unsplash.com/photo-1609591839311-d5365f9ff1c5?w=400&q=80', description: 'Colgate Strong Teeth anticavity fluoride toothpaste, 200g' },
    { name: 'Oral-B Toothbrush Medium',  sku: 'CRE-002', barcode: '4015600878054', buyingPrice: 48,   sellingPrice: 80,   discountPercent: 0,  stockQuantity: 75,  minimumStock: 15, categoryId: catCare.id, imageUrl: 'https://images.unsplash.com/photo-1559589689-577aabd1db4f?w=400&q=80', description: 'Oral-B clean & fresh medium bristle toothbrush' },
    { name: 'Dove Cream Beauty Bar 100g', sku: 'CRE-003', barcode: '8710447291597', buyingPrice: 68,   sellingPrice: 100,  discountPercent: 5,  stockQuantity: 100, minimumStock: 20, categoryId: catCare.id, imageUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80', description: 'Dove beauty cream bar with ¼ moisturising cream, 100g' },
    { name: 'Lifebuoy Total 10 Soap 125g', sku: 'CRE-004', barcode: '8901030849656', buyingPrice: 35,   sellingPrice: 55,   discountPercent: 0,  stockQuantity: 120, minimumStock: 25, categoryId: catCare.id, imageUrl: 'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?w=400&q=80', description: 'Lifebuoy Total 10 germ protection soap, 125g' },
    { name: 'Head & Shoulders 180ml',    sku: 'CRE-005', barcode: '8001841439266', buyingPrice: 275,  sellingPrice: 390,  discountPercent: 0,  stockQuantity: 60,  minimumStock: 10, categoryId: catCare.id, imageUrl: 'https://images.unsplash.com/photo-1585652757173-349d0a6cffd0?w=400&q=80', description: 'Head & Shoulders smooth & silky anti-dandruff shampoo, 180ml' },
    { name: 'Pantene Silky Smooth 180ml', sku: 'CRE-006', barcode: '8001090357083', buyingPrice: 258,  sellingPrice: 370,  discountPercent: 5,  stockQuantity: 55,  minimumStock: 10, categoryId: catCare.id, imageUrl: 'https://images.unsplash.com/photo-1585652757173-349d0a6cffd0?w=400&q=80', description: 'Pantene Pro-V silky smooth care shampoo, 180ml' },
    { name: 'Dettol Hand Sanitizer 50ml', sku: 'CRE-007', barcode: '6294003592406', buyingPrice: 78,   sellingPrice: 120,  discountPercent: 0,  stockQuantity: 90,  minimumStock: 20, categoryId: catCare.id, imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80', description: 'Dettol instant hand sanitizer original, 50ml bottle' },
    { name: 'Nivea Body Lotion 200ml',   sku: 'CRE-008', barcode: '4005808588701', buyingPrice: 280,  sellingPrice: 395,  discountPercent: 0,  stockQuantity: 50,  minimumStock: 8,  categoryId: catCare.id, imageUrl: 'https://images.unsplash.com/photo-1556228720-da04cfd72a93?w=400&q=80', description: 'Nivea Soft moisturising lotion with vitamin E, 200ml' },
    { name: 'Gillette Mach3 Razor',      sku: 'CRE-009', barcode: '7702018399741', buyingPrice: 340,  sellingPrice: 490,  discountPercent: 0,  stockQuantity: 40,  minimumStock: 8,  categoryId: catCare.id, imageUrl: 'https://images.unsplash.com/photo-1621607511693-a86c5b2dd33e?w=400&q=80', description: 'Gillette Mach3 3-blade disposable safety razor' },
    { name: 'Himalaya Purifying Neem Face Wash 100ml', sku: 'CRE-010', barcode: '8901138829780', buyingPrice: 118, sellingPrice: 175, discountPercent: 0, stockQuantity: 65, minimumStock: 12, categoryId: catCare.id, imageUrl: 'https://images.unsplash.com/photo-1556228720-da04cfd72a93?w=400&q=80', description: 'Himalaya purifying neem face wash, 100ml tube' },
    { name: 'Vaseline Petroleum Jelly 100ml', sku: 'CRE-011', barcode: '8710447390573', buyingPrice: 95, sellingPrice: 145, discountPercent: 0, stockQuantity: 75, minimumStock: 15, categoryId: catCare.id, imageUrl: 'https://images.unsplash.com/photo-1556228720-da04cfd72a93?w=400&q=80', description: 'Vaseline original pure petroleum jelly, 100ml jar' },
    { name: 'Veet Hair Removal Cream 100g', sku: 'CRE-012', barcode: '3059943005651', buyingPrice: 180, sellingPrice: 260, discountPercent: 0, stockQuantity: 35, minimumStock: 8, categoryId: catCare.id, imageUrl: 'https://images.unsplash.com/photo-1556228720-da04cfd72a93?w=400&q=80', description: 'Veet hair removal cream for sensitive skin, 100g tube' },
    { name: 'Listerine Cool Mint 250ml', sku: 'CRE-013', barcode: '6291107021481', buyingPrice: 215,  sellingPrice: 310,  discountPercent: 0,  stockQuantity: 48,  minimumStock: 10, categoryId: catCare.id, imageUrl: 'https://images.unsplash.com/photo-1559589689-577aabd1db4f?w=400&q=80', description: 'Listerine Cool Mint antiseptic mouthwash, 250ml bottle' },

    // ── Electronics & Accessories (10) ────────────────────────────────────────
    { name: 'USB-C Charging Cable 1m',   sku: 'ELC-001', barcode: '6958444285985', buyingPrice: 145,  sellingPrice: 250,  discountPercent: 0,  stockQuantity: 80,  minimumStock: 15, categoryId: catElec.id, imageUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80', description: 'Braided USB Type-C to USB-A fast charging cable, 1 metre' },
    { name: 'Sony MDR-EX150 Earphones',  sku: 'ELC-002', barcode: '4905524968545', buyingPrice: 820,  sellingPrice: 1250, discountPercent: 0,  stockQuantity: 30,  minimumStock: 5,  categoryId: catElec.id, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80', description: 'Sony MDR-EX150 in-ear headphones with mic, 9mm driver' },
    { name: 'Silicone Phone Case (Universal)', sku: 'ELC-003', barcode: '6902176014123', buyingPrice: 95, sellingPrice: 200, discountPercent: 0, stockQuantity: 60, minimumStock: 10, categoryId: catElec.id, imageUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&q=80', description: 'Anti-shock matte silicone back cover for 6.5–6.7 inch phones' },
    { name: 'Tempered Glass Screen Protector', sku: 'ELC-004', barcode: '6902176018350', buyingPrice: 75, sellingPrice: 150, discountPercent: 0, stockQuantity: 70, minimumStock: 15, categoryId: catElec.id, imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80', description: '9H hardness tempered glass screen protector, universal 6.1–6.5 inch' },
    { name: 'Portronics Power Bank 10000mAh', sku: 'ELC-005', barcode: '8906049950263', buyingPrice: 1250, sellingPrice: 1850, discountPercent: 5, stockQuantity: 22, minimumStock: 5, categoryId: catElec.id, imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&q=80', description: 'Portronics Charge Mate 10000mAh slim power bank, dual USB output' },
    { name: 'Duracell AA Batteries 4pk',  sku: 'ELC-006', barcode: '5000394149014', buyingPrice: 85,   sellingPrice: 135,  discountPercent: 0,  stockQuantity: 90,  minimumStock: 20, categoryId: catElec.id, imageUrl: 'https://images.unsplash.com/photo-1620714223084-8fcacc2daa5c?w=400&q=80', description: 'Duracell Plus AA alkaline batteries, pack of 4' },
    { name: 'Duracell AAA Batteries 4pk', sku: 'ELC-007', barcode: '5000394003941', buyingPrice: 85,   sellingPrice: 135,  discountPercent: 0,  stockQuantity: 85,  minimumStock: 20, categoryId: catElec.id, imageUrl: 'https://images.unsplash.com/photo-1620714223084-8fcacc2daa5c?w=400&q=80', description: 'Duracell Plus AAA alkaline batteries, pack of 4' },
    { name: 'OTG Adapter USB-C to USB-A', sku: 'ELC-008', barcode: '6902176021350', buyingPrice: 55, sellingPrice: 120, discountPercent: 0, stockQuantity: 55, minimumStock: 10, categoryId: catElec.id, imageUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80', description: 'USB Type-C male to USB-A female OTG adapter, aluminium body' },
    { name: 'JBL Go 3 Bluetooth Speaker', sku: 'ELC-009', barcode: '6925281993701', buyingPrice: 2100, sellingPrice: 3200, discountPercent: 5, stockQuantity: 15, minimumStock: 3, categoryId: catElec.id, imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80', description: 'JBL Go 3 portable waterproof Bluetooth speaker, 5 hrs battery' },
    { name: 'Mi 20W Fast Charger Adapter', sku: 'ELC-010', barcode: '6934177749612', buyingPrice: 480, sellingPrice: 750, discountPercent: 0, stockQuantity: 35, minimumStock: 8, categoryId: catElec.id, imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80', description: 'Xiaomi 20W USB Type-C PD fast charger adapter, foldable plug' },

    // ── Dairy & Bakery (9) ────────────────────────────────────────────────────
    { name: 'Amul Butter Salted 100g',   sku: 'DAI-001', barcode: '8901058851023', buyingPrice: 55,   sellingPrice: 78,   discountPercent: 0,  stockQuantity: 60,  minimumStock: 15, categoryId: catDairy.id, imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80', description: 'Amul pasteurised salted butter, 100g pack' },
    { name: 'Amul Cheese Slices 750g',   sku: 'DAI-002', barcode: '8901058000029', buyingPrice: 82,   sellingPrice: 118,  discountPercent: 0,  stockQuantity: 40,  minimumStock: 10, categoryId: catDairy.id, imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80', description: 'Amul processed cheese slices, pack of 7 slices (100g)' },
    { name: 'Sujal Fresh Milk 1L',       sku: 'DAI-003', barcode: '6916020000031', buyingPrice: 68,   sellingPrice: 90,   discountPercent: 0,  stockQuantity: 50,  minimumStock: 20, categoryId: catDairy.id, imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80', description: 'Sujal fresh pasteurised full-cream milk, 1 litre pouch' },
    { name: 'Wai Wai Dahi (Yogurt) 400g', sku: 'DAI-004', barcode: '6916020000055', buyingPrice: 45, sellingPrice: 68, discountPercent: 0, stockQuantity: 45, minimumStock: 15, categoryId: catDairy.id, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80', description: 'Fresh set yogurt (dahi), 400g plastic cup' },
    { name: 'Britannia Bread Sliced 400g', sku: 'DAI-005', barcode: '8901063000156', buyingPrice: 38, sellingPrice: 58, discountPercent: 0, stockQuantity: 30, minimumStock: 10, categoryId: catDairy.id, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', description: 'Britannia 100% whole wheat sliced bread, 400g loaf' },
    { name: 'Farm Fresh Eggs (6 pack)',   sku: 'DAI-006', barcode: '6916020000079', buyingPrice: 58,   sellingPrice: 85,   discountPercent: 0,  stockQuantity: 35,  minimumStock: 10, categoryId: catDairy.id, imageUrl: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400&q=80', description: 'Grade A farm fresh white eggs, tray of 6' },
    { name: 'Nestlé MILO 200ml Tetra',   sku: 'DAI-007', barcode: '9556001200006', buyingPrice: 42,   sellingPrice: 65,   discountPercent: 0,  stockQuantity: 80,  minimumStock: 20, categoryId: catDairy.id, imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80', description: 'Nestlé MILO chocolate malt drink, 200ml Tetra Pak' },
    { name: 'Cream of Wheat (Suji) 500g', sku: 'DAI-008', barcode: '6916020000093', buyingPrice: 35, sellingPrice: 55, discountPercent: 0, stockQuantity: 55, minimumStock: 12, categoryId: catDairy.id, imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80', description: 'Fine semolina wheat flour (rava/suji), 500g bag' },
    { name: 'Pillsbury Whole Wheat Atta 1kg', sku: 'DAI-009', barcode: '8901030011581', buyingPrice: 78, sellingPrice: 115, discountPercent: 0, stockQuantity: 45, minimumStock: 10, categoryId: catDairy.id, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', description: 'Pillsbury chakki fresh whole wheat flour, 1kg pack' },

    // ── Household Essentials (9) ───────────────────────────────────────────────
    { name: 'Surf Excel Easy Wash 1kg',  sku: 'HOU-001', barcode: '8901030764149', buyingPrice: 178,  sellingPrice: 255,  discountPercent: 5,  stockQuantity: 70,  minimumStock: 15, categoryId: catHouse.id, imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&q=80', description: 'Surf Excel easy wash detergent powder, 1kg pack' },
    { name: 'Ariel Matic Top Load 500g', sku: 'HOU-002', barcode: '8001841432779', buyingPrice: 148,  sellingPrice: 220,  discountPercent: 0,  stockQuantity: 60,  minimumStock: 12, categoryId: catHouse.id, imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&q=80', description: 'Ariel Matic top load detergent powder, 500g pack' },
    { name: 'Vim Dishwash Liquid 500ml', sku: 'HOU-003', barcode: '8901030802408', buyingPrice: 88,   sellingPrice: 135,  discountPercent: 0,  stockQuantity: 80,  minimumStock: 15, categoryId: catHouse.id, imageUrl: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&q=80', description: 'Vim lemon dishwash concentrated liquid, 500ml bottle' },
    { name: 'Harpic Power Plus 500ml',   sku: 'HOU-004', barcode: '6294003592420', buyingPrice: 138,  sellingPrice: 195,  discountPercent: 0,  stockQuantity: 55,  minimumStock: 10, categoryId: catHouse.id, imageUrl: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&q=80', description: 'Harpic Power Plus toilet cleaner original, 500ml bottle' },
    { name: 'Scotch-Brite Scrub Pad 3pk', sku: 'HOU-005', barcode: '5902734040285', buyingPrice: 32,   sellingPrice: 55,   discountPercent: 0,  stockQuantity: 100, minimumStock: 20, categoryId: catHouse.id, imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80', description: 'Scotch-Brite heavy-duty scrub pads, pack of 3' },
    { name: 'Dettol Antiseptic Liquid 200ml', sku: 'HOU-006', barcode: '6294003592413', buyingPrice: 148, sellingPrice: 210, discountPercent: 0, stockQuantity: 65, minimumStock: 12, categoryId: catHouse.id, imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80', description: 'Dettol original antiseptic disinfectant liquid, 200ml bottle' },
    { name: 'Candles White 6pk',         sku: 'HOU-007', barcode: '6916020000116', buyingPrice: 48,   sellingPrice: 80,   discountPercent: 0,  stockQuantity: 90,  minimumStock: 20, categoryId: catHouse.id, imageUrl: 'https://images.unsplash.com/photo-1518228684598-64edc6bf2c7e?w=400&q=80', description: 'White paraffin wax candles 6 inch, pack of 6' },
    { name: 'Black Garbage Bags 30pcs',  sku: 'HOU-008', barcode: '6916020000130', buyingPrice: 58,   sellingPrice: 95,   discountPercent: 0,  stockQuantity: 85,  minimumStock: 20, categoryId: catHouse.id, imageUrl: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&q=80', description: 'Heavy-duty black garbage/trash bags, 30 litre, pack of 30' },
    { name: 'Lizol Floor Cleaner 500ml', sku: 'HOU-009', barcode: '8901030781474', buyingPrice: 115,  sellingPrice: 165,  discountPercent: 5,  stockQuantity: 50,  minimumStock: 10, categoryId: catHouse.id, imageUrl: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&q=80', description: 'Lizol surface disinfectant floor cleaner, citrus, 500ml' },

    // ── Stationery & Office (8) ───────────────────────────────────────────────
    { name: 'Classmate 200-Page Notebook', sku: 'STA-001', barcode: '8901023038033', buyingPrice: 78, sellingPrice: 120, discountPercent: 0, stockQuantity: 60, minimumStock: 10, categoryId: catStat.id, imageUrl: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&q=80', description: 'Classmate single-line ruled notebook, 200 pages, A4 size' },
    { name: 'Reynolds Racer Gel Pen 10pk', sku: 'STA-002', barcode: '8901737000267', buyingPrice: 58, sellingPrice: 95, discountPercent: 0, stockQuantity: 80, minimumStock: 15, categoryId: catStat.id, imageUrl: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&q=80', description: 'Reynolds Racer gel pens blue ink 0.5mm, pack of 10' },
    { name: 'Kores Stapler No. 10',       sku: 'STA-003', barcode: '4003329005050', buyingPrice: 148,  sellingPrice: 225,  discountPercent: 0,  stockQuantity: 30,  minimumStock: 5,  categoryId: catStat.id, imageUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=400&q=80', description: 'Kores stapler number 10 with 1000 staple pins' },
    { name: 'Faber-Castell Scissors',     sku: 'STA-004', barcode: '4005401800477', buyingPrice: 85,   sellingPrice: 140,  discountPercent: 0,  stockQuantity: 40,  minimumStock: 8,  categoryId: catStat.id, imageUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=400&q=80', description: 'Faber-Castell stainless steel scissors, 17cm, soft grip handles' },
    { name: 'Scotch Magic Tape 19mm×33m', sku: 'STA-005', barcode: '0021200691003', buyingPrice: 42,   sellingPrice: 70,   discountPercent: 0,  stockQuantity: 75,  minimumStock: 15, categoryId: catStat.id, imageUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=400&q=80', description: 'Scotch magic transparent tape 19mm × 33m on plastic dispenser' },
    { name: 'Post-it Notes 3×3 100pk',    sku: 'STA-006', barcode: '0021200502100', buyingPrice: 68,   sellingPrice: 110,  discountPercent: 0,  stockQuantity: 55,  minimumStock: 10, categoryId: catStat.id, imageUrl: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&q=80', description: 'Post-it self-stick notes 3×3 inch canary yellow, 100 sheets' },
    { name: 'Camlin Pencil HB 12pk',      sku: 'STA-007', barcode: '8901207005145', buyingPrice: 55,   sellingPrice: 90,   discountPercent: 0,  stockQuantity: 70,  minimumStock: 15, categoryId: catStat.id, imageUrl: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&q=80', description: 'Camlin HB graphite pencil with eraser tip, box of 12' },
    { name: 'Citizen CT-555N Calculator', sku: 'STA-008', barcode: '4562195138462', buyingPrice: 395,  sellingPrice: 620,  discountPercent: 0,  stockQuantity: 22,  minimumStock: 5,  categoryId: catStat.id, imageUrl: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400&q=80', description: 'Citizen CT-555N 10-digit desktop calculator, solar + battery' },

    // ── Health & Wellness (7) ─────────────────────────────────────────────────
    { name: 'Paracetamol 500mg 10 tabs',  sku: 'HLT-001', barcode: '6912950320013', buyingPrice: 14,   sellingPrice: 25,   discountPercent: 0,  stockQuantity: 200, minimumStock: 50, categoryId: catHealth.id, imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80', description: 'Paracetamol 500mg fever & pain relief tablets, strip of 10' },
    { name: 'Vitamin C 500mg 30 tabs',    sku: 'HLT-002', barcode: '8906006230013', buyingPrice: 240,  sellingPrice: 360,  discountPercent: 0,  stockQuantity: 55,  minimumStock: 10, categoryId: catHealth.id, imageUrl: 'https://images.unsplash.com/photo-1550572017-4fcdbb59cc32?w=400&q=80', description: 'Vitamin C 500mg effervescent tablets, orange flavour, 30 tabs' },
    { name: 'Band-Aid Flex 10 Strips',    sku: 'HLT-003', barcode: '3574661215174', buyingPrice: 48,   sellingPrice: 80,   discountPercent: 0,  stockQuantity: 90,  minimumStock: 20, categoryId: catHealth.id, imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80', description: 'Band-Aid flexible fabric adhesive bandages, 10 assorted strips' },
    { name: 'Glucon-D Orange 500g',       sku: 'HLT-004', barcode: '8901030761995', buyingPrice: 148,  sellingPrice: 215,  discountPercent: 0,  stockQuantity: 45,  minimumStock: 8,  categoryId: catHealth.id, imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80', description: 'Glucon-D orange instant energy glucose drink, 500g tin' },
    { name: 'Vicks VapoRub 25g',         sku: 'HLT-005', barcode: '8901030503046', buyingPrice: 78,   sellingPrice: 125,  discountPercent: 0,  stockQuantity: 65,  minimumStock: 15, categoryId: catHealth.id, imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80', description: 'Vicks VapoRub cough & cold relief ointment, 25g jar' },
    { name: 'Hajmola Regular 120 tabs',   sku: 'HLT-006', barcode: '8901030769601', buyingPrice: 38,   sellingPrice: 65,   discountPercent: 0,  stockQuantity: 110, minimumStock: 20, categoryId: catHealth.id, imageUrl: 'https://images.unsplash.com/photo-1550572017-4fcdbb59cc32?w=400&q=80', description: 'Dabur Hajmola digestive tablets regular flavour, 120 tabs' },
    { name: 'Dabur Chyawanprash 500g',    sku: 'HLT-007', barcode: '8901207040429', buyingPrice: 178,  sellingPrice: 260,  discountPercent: 5,  stockQuantity: 40,  minimumStock: 8,  categoryId: catHealth.id, imageUrl: 'https://images.unsplash.com/photo-1550572017-4fcdbb59cc32?w=400&q=80', description: 'Dabur Chyawanprash immunity booster with 40+ Ayurvedic herbs, 500g' },
  ]

  const productRecords = await Promise.all(
    productData.map(d =>
      prisma.product.create({
        data: {
          ...d,
          status: d.stockQuantity === 0 ? ProductStatus.OUT_OF_STOCK : ProductStatus.ACTIVE,
          createdAt: daysAgo(randomBetween(60, 350)),
        },
      })
    )
  )
  console.log(`✅ Created ${productRecords.length} products`)

  // ═══════════════════════════════════════════════════════════════════════════
  // INVENTORY LOGS  (30 realistic stock-change records)
  // ═══════════════════════════════════════════════════════════════════════════
  const inventoryLogData = [
    // Initial stock-in events
    { product: productRecords[0],  updatedBy: admin1, prev: 0,   curr: 120, reason: 'Initial stock received from supplier – Coca-Cola Pvt Ltd' },
    { product: productRecords[1],  updatedBy: admin1, prev: 0,   curr: 95,  reason: 'Initial stock received from supplier – PepsiCo Nepal' },
    { product: productRecords[14], updatedBy: admin2, prev: 0,   curr: 180, reason: 'Initial stock received – Frito-Lay batch #FL2024-09' },
    { product: productRecords[28], updatedBy: admin1, prev: 0,   curr: 85,  reason: 'Initial stock received from Colgate-Palmolive distributor' },
    { product: productRecords[42], updatedBy: admin2, prev: 0,   curr: 80,  reason: 'Initial USB cable stock from Shenzhen Electronics' },
    { product: productRecords[52], updatedBy: admin1, prev: 0,   curr: 60,  reason: 'Initial stock received – Amul dairy products' },
    // Restock events
    { product: productRecords[0],  updatedBy: staff1, prev: 30,  curr: 120, reason: 'Restocked after low inventory alert – PO #2024-1045' },
    { product: productRecords[2],  updatedBy: staff2, prev: 20,  curr: 80,  reason: 'Weekly replenishment from Varun Beverages depot' },
    { product: productRecords[7],  updatedBy: staff1, prev: 25,  curr: 130, reason: 'Restocked Frooti – bulk order from Parle Agro distributor' },
    { product: productRecords[16], updatedBy: staff3, prev: 18,  curr: 160, reason: 'Kurkure restocked – PO #2024-1067 approved by Admin Aarav' },
    { product: productRecords[19], updatedBy: staff4, prev: 5,   curr: 50,  reason: 'Pringles restocked – low stock alert triggered at 5 units' },
    { product: productRecords[33], updatedBy: admin1, prev: 10,  curr: 60,  reason: 'H&S shampoo restocked – seasonal demand increase' },
    { product: productRecords[43], updatedBy: staff2, prev: 8,   curr: 80,  reason: 'USB cables restocked from Anker distributor Nepal' },
    { product: productRecords[61], updatedBy: staff6, prev: 12,  curr: 70,  reason: 'Surf Excel restocked – bulk purchase 20% discount from HUL' },
    { product: productRecords[70], updatedBy: admin2, prev: 3,   curr: 60,  reason: 'Classmate notebooks restocked for back-to-school season' },
    // Stock adjustments / corrections
    { product: productRecords[5],  updatedBy: admin1, prev: 48,  curr: 45,  reason: 'Inventory audit – 3 units damaged (dented cans); written off' },
    { product: productRecords[21], updatedBy: staff1, prev: 165, curr: 160, reason: 'Inventory count adjustment – 5 units missing, under investigation' },
    { product: productRecords[29], updatedBy: admin2, prev: 42,  curr: 40,  reason: 'Damaged stock removed – 2 Dove bars with broken packaging' },
    { product: productRecords[54], updatedBy: staff3, prev: 38,  curr: 35,  reason: 'Stock adjustment – 3 egg packs with cracked eggs discarded' },
    { product: productRecords[76 - 1], updatedBy: admin1, prev: 42,  curr: 40,  reason: 'Audit correction – 2 Chyawanprash jars expired, removed from shelf' },
    // Sales deduction records (manual bulk deductions)
    { product: productRecords[8],  updatedBy: staff2, prev: 230, curr: 200, reason: 'Bulk sale adjustment – 30 Kinley bottles to corporate client' },
    { product: productRecords[22], updatedBy: staff1, prev: 125, curr: 120, reason: 'Sales floor deduction reconciled after stocktake – Oreo 133g' },
    { product: productRecords[36], updatedBy: staff4, prev: 75,  curr: 65,  reason: 'Colgate toothpaste – sold 10 units in BOGO promotion' },
    // Supplier return / excess stock
    { product: productRecords[47], updatedBy: admin1, prev: 25,  curr: 22,  reason: 'Returned 3 JBL Go 3 speakers to supplier – faulty charging port' },
    { product: productRecords[26], updatedBy: admin2, prev: 38,  curr: 35,  reason: 'Ferrero Rocher – 3 boxes returned (near expiry, supplier credit)' },
    // Promotion-related stock loads
    { product: productRecords[4],  updatedBy: staff6, prev: 40,  curr: 60,  reason: 'Restocked Red Bull – Dashain festival promotion begins tomorrow' },
    { product: productRecords[27], updatedBy: staff6, prev: 28,  curr: 55,  reason: 'Toblerone restocked – Christmas & New Year gift-box demand' },
    { product: productRecords[25], updatedBy: staff3, prev: 42,  curr: 55,  reason: 'M&Ms restocked – children\'s day school canteen bulk order' },
    { product: productRecords[60], updatedBy: staff2, prev: 48,  curr: 65,  reason: 'Dettol antiseptic restocked – flu season stock-up by Admin Priya' },
    { product: productRecords[9],  updatedBy: admin1, prev: 18,  curr: 55,  reason: 'Lipton Green Tea restocked – health-conscious demand surge noted' },
  ]

  const inventoryLogs = await Promise.all(
    inventoryLogData.map((d, i) =>
      prisma.inventoryLog.create({
        data: {
          productId:    d.product.id,
          updatedById:  d.updatedBy.id,
          previousStock: d.prev,
          newStock:     d.curr,
          changeAmount: d.curr - d.prev,
          reason:       d.reason,
          createdAt:    daysAgo(randomBetween(1, 180)),
        },
      })
    )
  )
  console.log(`✅ Created ${inventoryLogs.length} inventory logs`)

  // ═══════════════════════════════════════════════════════════════════════════
  // BILLS + BILL ITEMS  (25 bills)
  // ═══════════════════════════════════════════════════════════════════════════
  async function createBill(opts) {
    let subtotal = 0
    let totalDiscount = 0

    const itemsCalc = opts.items.map(({ product, qty }) => {
      const linePrice = Number(product.sellingPrice) * qty
      const lineDiscount = linePrice * (product.discountPercent / 100)
      subtotal += linePrice
      totalDiscount += lineDiscount
      return { product, qty, linePrice, lineDiscount }
    })

    const finalAmount = subtotal - totalDiscount

    const bill = await prisma.bill.create({
      data: {
        billNumber:    opts.billNumber,
        createdById:   opts.createdBy.id,
        memberId:      opts.member?.id ?? null,
        subtotal,
        totalDiscount,
        finalAmount,
        paymentMethod: opts.paymentMethod,
        status:        opts.status ?? BillStatus.COMPLETED,
        createdAt:     opts.createdAt,
        billItems: {
          create: itemsCalc.map(({ product, qty, linePrice, lineDiscount }) => ({
            productId:      product.id,
            quantity:       qty,
            productPrice:   product.sellingPrice,
            discountPercent: product.discountPercent,
            totalPrice:     linePrice - lineDiscount,
            createdAt:      opts.createdAt,
          })),
        },
      },
    })
    return bill
  }

  const [m1, m2, m3, m4, m5, m6, m7, m8, m9, m10] = memberRecords
  // product aliases for readability
  const p = productRecords

  const bills = await Promise.all([
    createBill({ billNumber: 'INV-2024-0001', createdBy: staff1, member: m1, paymentMethod: PaymentMethod.CASH,           createdAt: daysAgo(180), items: [{ product: p[0], qty: 4 }, { product: p[14], qty: 2 }, { product: p[20], qty: 1 }] }),
    createBill({ billNumber: 'INV-2024-0002', createdBy: staff2, member: m3, paymentMethod: PaymentMethod.CARD,           createdAt: daysAgo(175), items: [{ product: p[28], qty: 2 }, { product: p[29], qty: 1 }, { product: p[36], qty: 1 }] }),
    createBill({ billNumber: 'INV-2024-0003', createdBy: staff1,             paymentMethod: PaymentMethod.DIGITAL_WALLET, createdAt: daysAgo(170), items: [{ product: p[4], qty: 2 }, { product: p[5], qty: 3 }, { product: p[8], qty: 6 }] }),
    createBill({ billNumber: 'INV-2024-0004', createdBy: admin2, member: m2, paymentMethod: PaymentMethod.CASH,           createdAt: daysAgo(165), items: [{ product: p[42], qty: 1 }, { product: p[43], qty: 2 }, { product: p[45], qty: 1 }] }),
    createBill({ billNumber: 'INV-2024-0005', createdBy: staff3, member: m5, paymentMethod: PaymentMethod.CARD,           createdAt: daysAgo(160), items: [{ product: p[52], qty: 2 }, { product: p[53], qty: 1 }, { product: p[54], qty: 2 }, { product: p[56], qty: 1 }] }),
    createBill({ billNumber: 'INV-2024-0006', createdBy: staff4,             paymentMethod: PaymentMethod.CASH,           createdAt: daysAgo(155), items: [{ product: p[61], qty: 1 }, { product: p[62], qty: 2 }, { product: p[63], qty: 1 }] }),
    createBill({ billNumber: 'INV-2024-0007', createdBy: staff1, member: m7, paymentMethod: PaymentMethod.DIGITAL_WALLET, createdAt: daysAgo(140), items: [{ product: p[70], qty: 3 }, { product: p[71], qty: 2 }, { product: p[73], qty: 1 }] }),
    createBill({ billNumber: 'INV-2024-0008', createdBy: staff2,             paymentMethod: PaymentMethod.CARD,           createdAt: daysAgo(130), items: [{ product: p[76 - 1], qty: 1 }, { product: p[74], qty: 2 }, { product: p[75], qty: 1 }] }),
    createBill({ billNumber: 'INV-2024-0009', createdBy: admin1, member: m4, paymentMethod: PaymentMethod.CASH,           createdAt: daysAgo(120), items: [{ product: p[0], qty: 6 }, { product: p[1], qty: 4 }, { product: p[3], qty: 4 }, { product: p[11], qty: 3 }] }),
    createBill({ billNumber: 'INV-2024-0010', createdBy: staff3, member: m8, paymentMethod: PaymentMethod.DIGITAL_WALLET, createdAt: daysAgo(115), items: [{ product: p[15], qty: 2 }, { product: p[17], qty: 1 }, { product: p[18], qty: 3 }] }),
    createBill({ billNumber: 'INV-2024-0011', createdBy: staff4,             paymentMethod: PaymentMethod.CASH,           createdAt: daysAgo(110), items: [{ product: p[6], qty: 5 }, { product: p[7], qty: 5 }, { product: p[8], qty: 10 }] }),
    createBill({ billNumber: 'INV-2024-0012', createdBy: staff1, member: m6, paymentMethod: PaymentMethod.CARD,           createdAt: daysAgo(100), items: [{ product: p[30], qty: 1 }, { product: p[31], qty: 2 }, { product: p[34], qty: 1 }, { product: p[37], qty: 1 }] }),
    createBill({ billNumber: 'INV-2024-0013', createdBy: staff2,             paymentMethod: PaymentMethod.DIGITAL_WALLET, createdAt: daysAgo(95),  items: [{ product: p[44], qty: 1 }, { product: p[46], qty: 3 }, { product: p[47], qty: 1 }] }),
    createBill({ billNumber: 'INV-2024-0014', createdBy: admin2, member: m3, paymentMethod: PaymentMethod.CARD,           createdAt: daysAgo(90),  items: [{ product: p[22], qty: 2 }, { product: p[23], qty: 1 }, { product: p[24], qty: 3 }, { product: p[26], qty: 1 }] }),
    createBill({ billNumber: 'INV-2024-0015', createdBy: staff3, member: m1, paymentMethod: PaymentMethod.CASH,           createdAt: daysAgo(85),  items: [{ product: p[55], qty: 1 }, { product: p[57], qty: 2 }, { product: p[58], qty: 1 }] }),
    // CANCELLED bills
    createBill({ billNumber: 'INV-2024-0016', createdBy: staff4,             paymentMethod: PaymentMethod.CARD,           createdAt: daysAgo(80),  status: BillStatus.CANCELLED, items: [{ product: p[0], qty: 12 }, { product: p[4], qty: 6 }] }),
    createBill({ billNumber: 'INV-2024-0017', createdBy: staff1, member: m9, paymentMethod: PaymentMethod.DIGITAL_WALLET, createdAt: daysAgo(75),  items: [{ product: p[66], qty: 2 }, { product: p[67], qty: 1 }, { product: p[68], qty: 1 }] }),
    createBill({ billNumber: 'INV-2024-0018', createdBy: staff2, member: m2, paymentMethod: PaymentMethod.CASH,           createdAt: daysAgo(70),  items: [{ product: p[64], qty: 1 }, { product: p[65], qty: 2 }, { product: p[69], qty: 1 }] }),
    createBill({ billNumber: 'INV-2024-0019', createdBy: admin1, member: m7, paymentMethod: PaymentMethod.CARD,           createdAt: daysAgo(60),  items: [{ product: p[19], qty: 2 }, { product: p[20], qty: 1 }, { product: p[21], qty: 2 }, { product: p[25], qty: 1 }] }),
    createBill({ billNumber: 'INV-2024-0020', createdBy: staff6,             paymentMethod: PaymentMethod.DIGITAL_WALLET, createdAt: daysAgo(55),  items: [{ product: p[38], qty: 1 }, { product: p[39], qty: 1 }, { product: p[40], qty: 2 }] }),
    createBill({ billNumber: 'INV-2024-0021', createdBy: staff3, member: m5, paymentMethod: PaymentMethod.CASH,           createdAt: daysAgo(45),  items: [{ product: p[9], qty: 1 }, { product: p[12], qty: 2 }, { product: p[13], qty: 3 }] }),
    createBill({ billNumber: 'INV-2024-0022', createdBy: staff4, member: m10,paymentMethod: PaymentMethod.CARD,           createdAt: daysAgo(35),  items: [{ product: p[72], qty: 4 }, { product: p[73], qty: 1 }, { product: p[74], qty: 2 }] }),
    // PENDING bills (recent)
    createBill({ billNumber: 'INV-2024-0023', createdBy: staff1,             paymentMethod: PaymentMethod.DIGITAL_WALLET, createdAt: daysAgo(20),  status: BillStatus.PENDING, items: [{ product: p[48], qty: 1 }, { product: p[49], qty: 2 }] }),
    createBill({ billNumber: 'INV-2024-0024', createdBy: staff2, member: m8, paymentMethod: PaymentMethod.CASH,           createdAt: daysAgo(10),  items: [{ product: p[0], qty: 2 }, { product: p[14], qty: 1 }, { product: p[61], qty: 1 }, { product: p[28], qty: 1 }] }),
    createBill({ billNumber: 'INV-2024-0025', createdBy: admin2, member: m3, paymentMethod: PaymentMethod.CARD,           createdAt: daysAgo(2),   items: [{ product: p[44], qty: 2 }, { product: p[46], qty: 1 }, { product: p[47], qty: 1 }, { product: p[50], qty: 1 }] }),
  ])

  console.log(`✅ Created ${bills.length} bills with bill items`)
  console.log('\n🎉 Seed completed successfully!')
  console.log('─'.repeat(50))
  console.log(`   Staff:          ${staffRecords.length} (2 admins, 6 staff)`)
  console.log(`   Members:        ${memberRecords.length}`)
  console.log(`   Categories:     ${categoryRecords.length}`)
  console.log(`   Products:       ${productRecords.length}`)
  console.log(`   Inventory Logs: ${inventoryLogs.length}`)
  console.log(`   Bills:          ${bills.length}`)
  console.log('─'.repeat(50))
  console.log('\n🔑 Login credentials')
  console.log('   Admin  → aarav.sharma@shopease.com  / Admin@123')
  console.log('   Admin  → priya.thapa@shopease.com   / Admin@123')
  console.log('   Staff  → bikash.karki@shopease.com  / Staff@123')
  } catch (error) {
    console.error('❌ Error during seeding:', error.message)
    if (error.code) console.error('   Code:', error.code)
    throw error
  }
}

main()
  .catch(e => { 
    console.error('❌ Seed error:', e); 
    process.exit(1) 
  })
  .finally(async () => { 
    await prisma.$disconnect();
    process.exit(0);
  })