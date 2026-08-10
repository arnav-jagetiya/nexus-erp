import { PrismaClient, UserRole, CustomerType, CustomerStatus, MovementType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed for NEXUS ERP...');

  // 1. Seed Users
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  const salesPasswordHash = await bcrypt.hash('Sales@123', 10);
  const warehousePasswordHash = await bcrypt.hash('Warehouse@123', 10);
  const accountsPasswordHash = await bcrypt.hash('Accounts@123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@nexus.com' },
    update: { name: 'Priya Sharma', role: UserRole.ADMIN, password: passwordHash, isActive: true },
    create: { email: 'admin@nexus.com', name: 'Priya Sharma', role: UserRole.ADMIN, password: passwordHash },
  });

  const salesUser = await prisma.user.upsert({
    where: { email: 'sales@nexus.com' },
    update: { name: 'Rahul Verma', role: UserRole.SALES, password: salesPasswordHash, isActive: true },
    create: { email: 'sales@nexus.com', name: 'Rahul Verma', role: UserRole.SALES, password: salesPasswordHash },
  });

  const warehouseUser = await prisma.user.upsert({
    where: { email: 'warehouse@nexus.com' },
    update: { name: 'Deepak Patel', role: UserRole.WAREHOUSE, password: warehousePasswordHash, isActive: true },
    create: { email: 'warehouse@nexus.com', name: 'Deepak Patel', role: UserRole.WAREHOUSE, password: warehousePasswordHash },
  });

  const accountsUser = await prisma.user.upsert({
    where: { email: 'accounts@nexus.com' },
    update: { name: 'Ananya Gupta', role: UserRole.ACCOUNTS, password: accountsPasswordHash, isActive: true },
    create: { email: 'accounts@nexus.com', name: 'Ananya Gupta', role: UserRole.ACCOUNTS, password: accountsPasswordHash },
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
      minStockAlert: 25, // Low Stock test
      location: 'Warehouse Bay C-01',
    },
    {
      name: 'Polycarbonate Hydrant Valve 4-inch',
      sku: 'PRD-HYD-004',
      category: 'Hardware & Piping',
      unitPrice: 4200.00,
      currentStock: 0,
      minStockAlert: 10, // Critical Stock test
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

    // Record initial stock movement log if stock > 0
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
