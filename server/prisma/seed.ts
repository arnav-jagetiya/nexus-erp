import { PrismaClient, UserRole, AccountStatus, CustomerType, CustomerStatus, MovementType, ChallanStatus, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed for NEXUS ERP...');

  // 1. Seed Users
  // Demo credentials for local development and evaluation only.
  // Do not use these credentials in production.
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  const salesPasswordHash = await bcrypt.hash('Sales@123', 10);
  const warehousePasswordHash = await bcrypt.hash('Warehouse@123', 10);
  const accountsPasswordHash = await bcrypt.hash('Accounts@123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@nexus.com' },
    update: { name: 'Arnav Jagetiya', role: UserRole.ADMIN, password: passwordHash, status: AccountStatus.ACTIVE, isPrimaryAdmin: true },
    create: { email: 'admin@nexus.com', name: 'Arnav Jagetiya', role: UserRole.ADMIN, password: passwordHash, status: AccountStatus.ACTIVE, isPrimaryAdmin: true },
  });

  const salesUser = await prisma.user.upsert({
    where: { email: 'sales@nexus.com' },
    update: { name: 'Sales Demo User', role: UserRole.SALES, password: salesPasswordHash, status: AccountStatus.ACTIVE },
    create: { email: 'sales@nexus.com', name: 'Sales Demo User', role: UserRole.SALES, password: salesPasswordHash, status: AccountStatus.ACTIVE },
  });

  const warehouseUser = await prisma.user.upsert({
    where: { email: 'warehouse@nexus.com' },
    update: { name: 'Warehouse Demo User', role: UserRole.WAREHOUSE, password: warehousePasswordHash, status: AccountStatus.ACTIVE },
    create: { email: 'warehouse@nexus.com', name: 'Warehouse Demo User', role: UserRole.WAREHOUSE, password: warehousePasswordHash, status: AccountStatus.ACTIVE },
  });

  const accountsUser = await prisma.user.upsert({
    where: { email: 'accounts@nexus.com' },
    update: { name: 'Accounts Demo User', role: UserRole.ACCOUNTS, password: accountsPasswordHash, status: AccountStatus.ACTIVE },
    create: { email: 'accounts@nexus.com', name: 'Accounts Demo User', role: UserRole.ACCOUNTS, password: accountsPasswordHash, status: AccountStatus.ACTIVE },
  });

  console.log('✅ Users seeded (Admin, Sales, Warehouse, Accounts)');

  // 2. Seed Customers
  const customer1 = await prisma.customer.upsert({
    where: { email: 'procurement@apexretail.in' },
    update: {},
    create: {
      name: 'Apex Supermart Pvt Ltd',
      mobile: '9876543210',
      email: 'procurement@apexretail.in',
      businessName: 'Apex Retail Enterprises',
      gstNumber: '27AAACA12341Z5',
      customerType: CustomerType.RETAIL,
      address: 'Plot 42, Industrial Area Phase II, Mumbai 400093',
      status: CustomerStatus.ACTIVE,
      notes: 'Key retail client in Western Region.',
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { email: 'orders@bharatwholesale.com' },
    update: {},
    create: {
      name: 'Bharat Wholesale Traders',
      mobile: '9811223344',
      email: 'orders@bharatwholesale.com',
      businessName: 'Bharat Traders & Distributors',
      gstNumber: '07AAACB98762Z1',
      customerType: CustomerType.WHOLESALE,
      address: '108 Commercial Street, Chandni Chowk, Delhi 110006',
      status: CustomerStatus.ACTIVE,
      notes: 'High-volume wholesale buyer.',
    },
  });

  const customer3 = await prisma.customer.upsert({
    where: { email: 'info@deltadistributors.org' },
    update: {},
    create: {
      name: 'Delta Global Logistics & Dist',
      mobile: '9744556677',
      email: 'info@deltadistributors.org',
      businessName: 'Delta Supply Chain Solutions',
      gstNumber: '29AAACC45673Z9',
      customerType: CustomerType.DISTRIBUTOR,
      address: 'Suite 302, Logistics Hub, Whitefield, Bengaluru 560066',
      status: CustomerStatus.LEAD,
      notes: 'Potential regional distributor for Southern territories.',
    },
  });

  console.log('✅ Customers seeded');

  // Seed Follow-ups
  await prisma.customerFollowUp.createMany({
    data: [
      {
        customerId: customer1.id,
        note: 'Initial contract negotiation completed. Awaiting GST confirmation.',
        createdBy: salesUser.id,
      },
      {
        customerId: customer2.id,
        note: 'Followed up on bulk order quantity discounts for Q3.',
        createdBy: salesUser.id,
      },
    ],
    skipDuplicates: true,
  });

  // 3. Seed Products
  const productsData = [
    {
      name: 'Heavy Duty Steel Pipe 2-inch',
      sku: 'PRD-STL-001',
      category: 'Hardware & Piping',
      unitPrice: 1450.00,
      currentStock: 150,
      minStockAlert: 30,
      location: 'Warehouse Bay A-12',
    },
    {
      name: 'Industrial Safety Helmet Yellow',
      sku: 'PRD-SAF-002',
      category: 'Safety Equipment',
      unitPrice: 350.50,
      currentStock: 80,
      minStockAlert: 20,
      location: 'Warehouse Bay B-04',
    },
    {
      name: 'Copper Electrical Cable 100m Roll',
      sku: 'PRD-ELE-003',
      category: 'Electrical Supplies',
      unitPrice: 2890.00,
      currentStock: 15,
      minStockAlert: 25,
      location: 'Warehouse Bay C-01',
    },
    {
      name: 'Polycarbonate Hydrant Valve 4-inch',
      sku: 'PRD-HYD-004',
      category: 'Hardware & Piping',
      unitPrice: 4200.00,
      currentStock: 0,
      minStockAlert: 10,
      location: 'Warehouse Bay A-05',
    },
    {
      name: 'Reinforced Rubber Work Gloves Pack 10',
      sku: 'PRD-SAF-005',
      category: 'Safety Equipment',
      unitPrice: 550.00,
      currentStock: 200,
      minStockAlert: 50,
      location: 'Warehouse Bay B-08',
    },
  ];

  const createdProductsMap = new Map<string, any>();
  for (const prod of productsData) {
    const product = await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {
        name: prod.name,
        category: prod.category,
        unitPrice: prod.unitPrice,
        currentStock: prod.currentStock,
        minStockAlert: prod.minStockAlert,
        location: prod.location,
      },
      create: prod,
    });
    createdProductsMap.set(prod.sku, product);

    if (prod.currentStock > 0) {
      await prisma.stockMovement.createMany({
        data: [
          {
            productId: product.id,
            quantity: prod.currentStock,
            movementType: MovementType.IN,
            reason: 'Initial warehouse opening inventory intake',
            createdById: warehouseUser.id,
          },
        ],
        skipDuplicates: true,
      });
    }
  }

  console.log('✅ Products & initial stock movements seeded');

  // 4. Seed Challans (Draft, Confirmed, Cancelled)
  const p1 = createdProductsMap.get('PRD-STL-001')!;
  const p2 = createdProductsMap.get('PRD-SAF-002')!;

  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  // Challan 1: DRAFT
  await prisma.challan.upsert({
    where: { challanNumber: `CHN-${today}-0001` },
    update: {},
    create: {
      challanNumber: `CHN-${today}-0001`,
      customerId: customer1.id,
      status: ChallanStatus.DRAFT,
      totalAmount: new Prisma.Decimal(1450.00 * 5 + 350.50 * 10),
      createdById: salesUser.id,
      items: {
        create: [
          {
            productId: p1.id,
            productName: p1.name,
            sku: p1.sku,
            unitPrice: p1.unitPrice,
            quantity: 5,
            lineTotal: new Prisma.Decimal(1450.00 * 5),
          },
          {
            productId: p2.id,
            productName: p2.name,
            sku: p2.sku,
            unitPrice: p2.unitPrice,
            quantity: 10,
            lineTotal: new Prisma.Decimal(350.50 * 10),
          },
        ],
      },
    },
  });

  // Challan 2: CONFIRMED
  await prisma.challan.upsert({
    where: { challanNumber: `CHN-${today}-0002` },
    update: {},
    create: {
      challanNumber: `CHN-${today}-0002`,
      customerId: customer2.id,
      status: ChallanStatus.CONFIRMED,
      totalAmount: new Prisma.Decimal(1450.00 * 2),
      createdById: salesUser.id,
      items: {
        create: [
          {
            productId: p1.id,
            productName: p1.name,
            sku: p1.sku,
            unitPrice: p1.unitPrice,
            quantity: 2,
            lineTotal: new Prisma.Decimal(1450.00 * 2),
          },
        ],
      },
    },
  });

  // Challan 3: CANCELLED
  await prisma.challan.upsert({
    where: { challanNumber: `CHN-${today}-0003` },
    update: {},
    create: {
      challanNumber: `CHN-${today}-0003`,
      customerId: customer3.id,
      status: ChallanStatus.CANCELLED,
      totalAmount: new Prisma.Decimal(350.50 * 5),
      createdById: salesUser.id,
      items: {
        create: [
          {
            productId: p2.id,
            productName: p2.name,
            sku: p2.sku,
            unitPrice: p2.unitPrice,
            quantity: 5,
            lineTotal: new Prisma.Decimal(350.50 * 5),
          },
        ],
      },
    },
  });

  console.log('✅ Sales Challans (Draft, Confirmed, Cancelled) seeded');
  console.log('🎉 Comprehensive database seed finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
