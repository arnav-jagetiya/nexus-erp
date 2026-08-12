import { PrismaClient } from '@prisma/client';
import http from 'http';

const prisma = new PrismaClient();

function requestApi(method, path, body = null, token = null) {
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
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); } 
        catch (e) { resolve({ status: res.statusCode, data: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function login(email, password) {
  const res = await requestApi('POST', '/auth/login', { email, password });
  return res.data.data.token;
}

async function runTest() {
  console.log('--- RBAC & Lifecycle Verification Test ---');
  let hasErrors = false;
  
  try {
    // Tokens
    const adminToken = await login('admin@nexus.com', 'Admin@123');
    const salesToken = await login('sales@nexus.com', 'Sales@123');
    const whToken = await login('warehouse@nexus.com', 'Warehouse@123');
    const accToken = await login('accounts@nexus.com', 'Accounts@123');

    // 1. RBAC Tests
    console.log('\nTesting RBAC Constraints...');
    
    // Sales trying to list users
    const salesUsersRes = await requestApi('GET', '/users', null, salesToken);
    if (salesUsersRes.status !== 403) {
      console.error('FAILURE: Sales could access /users', salesUsersRes.status);
      hasErrors = true;
    } else console.log('SUCCESS: Sales denied from /users');

    // Warehouse trying to read customers
    const whCustRes = await requestApi('GET', '/customers', null, whToken);
    if (whCustRes.status !== 403) {
      console.error('FAILURE: Warehouse could access /customers', whCustRes.status);
      hasErrors = true;
    } else console.log('SUCCESS: Warehouse denied from /customers');

    // Accounts trying to CREATE a customer
    const accCustCreateRes = await requestApi('POST', '/customers', {
      name: 'Test', email: 'test@t.com', businessName: 'Test', mobile: '1234567890', customerType: 'RETAIL'
    }, accToken);
    if (accCustCreateRes.status !== 403) {
      console.error('FAILURE: Accounts could create customer', accCustCreateRes.status);
      hasErrors = true;
    } else console.log('SUCCESS: Accounts denied from creating customer');

    // 2. Account Lifecycle Tests
    console.log('\nTesting Account Lifecycle...');
    
    // Suspend Sales
    const salesUser = await prisma.user.findUnique({ where: { email: 'sales@nexus.com' } });
    const suspendRes = await requestApi('PATCH', `/users/${salesUser.id}/suspend`, { reason: 'Testing' }, adminToken);
    if (suspendRes.status !== 200) {
      console.error('FAILURE: Admin failed to suspend Sales', suspendRes.data);
      hasErrors = true;
    } else {
      // Test if suspended sales can hit API using old JWT
      const suspendedReq = await requestApi('GET', '/auth/me', null, salesToken);
      if (suspendedReq.status !== 401 && suspendedReq.status !== 403) {
        console.error('FAILURE: Suspended user JWT is still valid!', suspendedReq.status);
        hasErrors = true;
      } else console.log('SUCCESS: Suspended user JWT was rejected.');
      
      // Reactivate
      await requestApi('PATCH', `/users/${salesUser.id}/reactivate`, {}, adminToken);
      console.log('SUCCESS: Sales reactivated');
    }

    // Try to suspend Primary Admin
    const adminUser = await prisma.user.findUnique({ where: { email: 'admin@nexus.com' } });
    const suspendAdminRes = await requestApi('PATCH', `/users/${adminUser.id}/suspend`, { reason: 'Testing' }, adminToken);
    if (suspendAdminRes.status !== 403 && suspendAdminRes.status !== 400) {
      console.error('FAILURE: Primary Admin was suspended!', suspendAdminRes.status);
      hasErrors = true;
    } else console.log('SUCCESS: Primary Admin protected from suspension');

    if (hasErrors) console.log('\nResult: COMPLETED WITH ERRORS');
    else console.log('\nResult: COMPLETED SUCCESSFULLY');

  } catch (e) {
    console.error('Test crashed', e);
  } finally {
    await prisma.$disconnect();
  }
}
runTest();
