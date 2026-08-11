import { PrismaClient, Role, CustomerType, CustomerStatus, StockMovementType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash default password
  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

  // 1. Seed Users
  console.log('Seeding Users...');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@erp.com' },
    update: {},
    create: {
      email: 'admin@erp.com',
      password: defaultPasswordHash,
      name: 'System Admin',
      role: Role.ADMIN,
    },
  });

  const salesUser = await prisma.user.upsert({
    where: { email: 'sales@erp.com' },
    update: {},
    create: {
      email: 'sales@erp.com',
      password: defaultPasswordHash,
      name: 'Sarah Sales Manager',
      role: Role.SALES,
    },
  });

  const warehouseUser = await prisma.user.upsert({
    where: { email: 'warehouse@erp.com' },
    update: {},
    create: {
      email: 'warehouse@erp.com',
      password: defaultPasswordHash,
      name: 'Walter Warehouse Supervisor',
      role: Role.WAREHOUSE,
    },
  });

  const accountsUser = await prisma.user.upsert({
    where: { email: 'accounts@erp.com' },
    update: {},
    create: {
      email: 'accounts@erp.com',
      password: defaultPasswordHash,
      name: 'Adam Accounts Executive',
      role: Role.ACCOUNTS,
    },
  });

  console.log('Users created:', { admin: admin.email, sales: salesUser.email, warehouse: warehouseUser.email, accounts: accountsUser.email });

  // 2. Seed Customers
  console.log('Seeding Customers...');
  const customersData = [
    {
      name: 'Rajesh Kumar',
      mobile: '+919876543210',
      email: 'rajesh@apexdistributors.com',
      businessName: 'Apex Industrial Distributors',
      gstNumber: '27AAACA12341ZV',
      customerType: CustomerType.DISTRIBUTOR,
      address: 'Plot 42, MIDC Industrial Area, Pune, Maharashtra 411026',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date('2026-08-20'),
    },
    {
      name: 'Suresh Patel',
      mobile: '+919812345678',
      email: 'suresh@patelhardware.com',
      businessName: 'Patel Hardware & Tools Mart',
      gstNumber: '24BBBCB56782ZW',
      customerType: CustomerType.WHOLESALE,
      address: 'Shop 12, Ring Road Market, Ahmedabad, Gujarat 380002',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date('2026-08-18'),
    },
    {
      name: 'Vikram Singh',
      mobile: '+919711223344',
      email: 'vikram@singhbuilders.in',
      businessName: 'Singh Builders & Contractors',
      gstNumber: '07CCCC11223ZX',
      customerType: CustomerType.RETAIL,
      address: 'Block B, Connaught Place, New Delhi 110001',
      status: CustomerStatus.LEAD,
      followUpDate: new Date('2026-08-15'),
    },
    {
      name: 'Anita Sharma',
      mobile: '+919988776655',
      email: 'anita@sharmaenterprises.com',
      businessName: 'Sharma Tools & Fasteners',
      gstNumber: '19DDDDE44554ZY',
      customerType: CustomerType.WHOLESALE,
      address: 'Sector V, Salt Lake, Kolkata, West Bengal 700091',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date('2026-08-25'),
    },
    {
      name: 'Manoj Verma',
      mobile: '+919345678901',
      email: 'manoj@vermasupply.com',
      businessName: 'Verma Supply Chain Solutions',
      gstNumber: undefined,
      customerType: CustomerType.RETAIL,
      address: 'Station Road, Jaipur, Rajasthan 302001',
      status: CustomerStatus.INACTIVE,
    },
  ];

  for (const cust of customersData) {
    const createdCustomer = await prisma.customer.create({
      data: {
        ...cust,
        createdById: salesUser.id,
        notes: {
          create: [
            {
              note: 'Initial inquiry received regarding bulk wholesale prices.',
              createdById: salesUser.id,
            },
          ],
        },
      },
    });
    console.log(`Created customer: ${createdCustomer.businessName}`);
  }

  // 3. Seed Products
  console.log('Seeding Products...');
  const productsData = [
    {
      name: 'Hex Bolt M10 x 50mm Stainless Steel',
      sku: 'FAST-BOLT-M10-50',
      category: 'Fasteners',
      unitPrice: 12.5,
      currentStock: 2500,
      minimumStock: 500,
      warehouseLocation: 'Aisle 3 - Rack A1',
    },
    {
      name: 'Industrial Heavy Duty Drill Machine 750W',
      sku: 'TOOL-DRILL-750W',
      category: 'Power Tools',
      unitPrice: 3450.0,
      currentStock: 45,
      minimumStock: 10,
      warehouseLocation: 'Aisle 1 - Rack C2',
    },
    {
      name: 'Safety Helmet High Visibility Yellow (ANSI Certified)',
      sku: 'SAFE-HELM-YEL',
      category: 'Safety Equipment',
      unitPrice: 280.0,
      currentStock: 8, // Low stock on purpose
      minimumStock: 20,
      warehouseLocation: 'Aisle 4 - Rack B3',
    },
    {
      name: 'High Performance Cutting Disc 4 Inch (Pack of 25)',
      sku: 'TOOL-DISC-4IN-25P',
      category: 'Abrasives',
      unitPrice: 420.0,
      currentStock: 120,
      minimumStock: 25,
      warehouseLocation: 'Aisle 2 - Rack D1',
    },
    {
      name: 'Adjustable Wrench Heavy Duty 12 Inch',
      sku: 'HAND-WRN-12IN',
      category: 'Hand Tools',
      unitPrice: 550.0,
      currentStock: 3, // Low stock on purpose
      minimumStock: 15,
      warehouseLocation: 'Aisle 1 - Rack A4',
    },
    {
      name: 'Industrial Safety Gloves Leather Pair',
      sku: 'SAFE-GLV-LTHR',
      category: 'Safety Equipment',
      unitPrice: 160.0,
      currentStock: 350,
      minimumStock: 50,
      warehouseLocation: 'Aisle 4 - Rack B1',
    },
  ];

  for (const prod of productsData) {
    const createdProduct = await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {},
      create: prod,
    });

    // Create initial stock movement log
    await prisma.stockMovement.create({
      data: {
        productId: createdProduct.id,
        quantity: createdProduct.currentStock,
        movementType: StockMovementType.IN,
        reason: 'Initial inventory intake seed',
        createdById: warehouseUser.id,
      },
    });

    console.log(`Created product: ${createdProduct.name} (${createdProduct.sku})`);
  }

  console.log('✅ Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
