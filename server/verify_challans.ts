import { PrismaClient } from '@prisma/client';
import http from 'http';

const prisma = new PrismaClient();

function requestApi(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (process.env.NEXUS_TOKEN) {
      options.headers['Authorization'] = `Bearer ${process.env.NEXUS_TOKEN}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTest() {
  console.log('--- Sales Challans Verification Test ---');
  let hasErrors = false;
  
  try {
    // PRE-SETUP
    let customer = await prisma.customer.findFirst();
    if (!customer) {
      console.log('Seeding customer...');
      customer = await prisma.customer.create({
        data: {
          name: 'Test Customer', mobile: '9999999999', email: 'test@customer.com',
          businessName: 'Test Corp', customerType: 'RETAIL', address: '123 Test St', status: 'ACTIVE'
        }
      });
    }

    let product = await prisma.product.findFirst();
    if (!product) {
      console.log('Seeding product...');
      product = await prisma.product.create({
        data: {
          name: 'Test Item', sku: 'TEST-SKU-1', category: 'Testing',
          unitPrice: 100, currentStock: 50, location: 'A1'
        }
      });
    } else {
      if (product.currentStock < 10) {
         await prisma.product.update({ where: { id: product.id }, data: { currentStock: 50 } });
      }
    }
    product = await prisma.product.findFirst();
    const initialStock = product.currentStock;
    console.log(`Initial stock for ${product.name}: ${initialStock}`);

    // LOGIN
    console.log('Logging in...');
   const adminEmail = process.env.NEXUS_ADMIN_EMAIL;
const adminPassword = process.env.NEXUS_ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  throw new Error('NEXUS_ADMIN_EMAIL and NEXUS_ADMIN_PASSWORD must be set.');
}

const loginRes = await requestApi('POST', '/auth/login', {
  email: adminEmail,
  password: adminPassword
});
    if (loginRes.status !== 200) throw new Error('Login failed');
    process.env.NEXUS_TOKEN = loginRes.data.data.token;

    // GET INVENTORY OVERVIEW
    const overviewInit = await requestApi('GET', '/inventory');
    const initialMovements = overviewInit.data.data.totalMovements;

    // CREATE DRAFT CHALLAN
    console.log('Creating DRAFT challan...');
    const challanData = {
      customerId: customer.id,
      items: [
        {
          productId: product.id,
          quantity: 2,
          unitPrice: product.unitPrice
        }
      ]
    };
    const createRes = await requestApi('POST', '/challans', challanData);
    if (createRes.status !== 201) {
      console.error('Failed to create challan:', createRes.data);
      hasErrors = true;
    }
    const challan = createRes.data.data;
    console.log(`Created Challan ID: ${challan.id}, Status: ${challan.status}`);

    // VERIFY INVENTORY (SHOULD BE UNCHANGED)
    const productMidRes = await requestApi('GET', `/products/${product.id}`);
    const productMid = productMidRes.data.data;
    if (productMid.currentStock !== initialStock) {
      console.error(`FAILURE: Draft creation altered stock! Expected ${initialStock}, got ${productMid.currentStock}`);
      hasErrors = true;
    } else {
      console.log('SUCCESS: Draft did not deduct stock.');
    }

    // CONFIRM CHALLAN
    console.log('Confirming challan...');
    const confirmRes = await requestApi('POST', `/challans/${challan.id}/confirm`);
    if (confirmRes.status !== 200) {
      console.error('Failed to confirm challan:', confirmRes.data);
      hasErrors = true;
    }
    console.log(`Challan status after confirm: ${confirmRes.data.data.status}`);

    // VERIFY INVENTORY DEDUCTION
    const productFinalRes = await requestApi('GET', `/products/${product.id}`);
    const productFinal = productFinalRes.data.data;
    const expectedStock = initialStock - 2;
    if (productFinal.currentStock !== expectedStock) {
      console.error(`FAILURE: Confirmation did not deduct stock! Expected ${expectedStock}, got ${productFinal.currentStock}`);
      hasErrors = true;
    } else {
      console.log(`SUCCESS: Stock correctly deducted by 2 (New stock: ${productFinal.currentStock}).`);
    }

    // VERIFY STOCK MOVEMENT
    const overviewFinal = await requestApi('GET', '/inventory');
    const finalMovements = overviewFinal.data.data.totalMovements;
    if (finalMovements === initialMovements + 1) {
      console.log('SUCCESS: Stock OUT movement was recorded exactly once.');
    } else {
      console.error(`FAILURE: Stock movement count incorrect. Expected ${initialMovements + 1}, got ${finalMovements}`);
      hasErrors = true;
    }

    if (hasErrors) {
      console.log('\nResult: COMPLETED WITH ERRORS');
    } else {
      console.log('\nResult: COMPLETED SUCCESSFULLY');
    }

  } catch (err) {
    console.error('Test crashed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
