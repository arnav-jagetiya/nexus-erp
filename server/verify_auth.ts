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

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
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
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTest() {
  console.log('--- Auth Verification Test ---');
  let hasErrors = false;
  
  try {
    const testUsers = [
      { email: `sales_${Date.now()}@nexuserp.com`, role: 'SALES', expectedStatus: 'ACTIVE' },
      { email: `wh_${Date.now()}@nexuserp.com`, role: 'WAREHOUSE', expectedStatus: 'ACTIVE' },
      { email: `acc_${Date.now()}@nexuserp.com`, role: 'ACCOUNTS', expectedStatus: 'ACTIVE' },
      { email: `admin_${Date.now()}@nexuserp.com`, role: 'ADMIN', expectedStatus: 'PENDING' },
    ];

    for (const u of testUsers) {
      console.log(`\nTesting registration for ${u.role}...`);
      const regRes = await requestApi('POST', '/auth/register', {
        email: u.email,
        password: 'password123',
        name: `Test ${u.role}`,
        requestedRole: u.role
      });
      
      if (regRes.status !== 200 && regRes.status !== 201) {
        console.error(`FAILURE: Failed to register ${u.role}. Status: ${regRes.status}`, regRes.data);
        hasErrors = true;
        continue;
      }
      
      const dbUser = await prisma.user.findUnique({ where: { email: u.email } });
      const currentStatus = u.role === 'ADMIN' ? dbUser.approvalStatus : dbUser.status;
      if (currentStatus !== u.expectedStatus) {
        console.error(`FAILURE: ${u.role} expected status ${u.expectedStatus}, got ${currentStatus}`);
        hasErrors = true;
      } else {
        console.log(`SUCCESS: ${u.role} status is correctly ${currentStatus}`);
      }

      // Test login
      const loginRes = await requestApi('POST', '/auth/login', { email: u.email, password: 'password123' });
      if (u.expectedStatus === 'ACTIVE') {
        if (loginRes.status !== 200 || !loginRes.data.data.token) {
          console.error(`FAILURE: Active user ${u.role} failed to login.`);
          hasErrors = true;
        } else {
          console.log(`SUCCESS: Active user ${u.role} logged in.`);
        }
      } else {
        if (loginRes.status === 200) {
          console.error(`FAILURE: Pending user ${u.role} was able to login!`);
          hasErrors = true;
        } else {
          console.log(`SUCCESS: Pending user ${u.role} prevented from login.`);
        }
      }
    }

    // Admin login for approvals
    console.log('\nLogging in as Primary Admin...');
    const adminEmail = process.env.NEXUS_ADMIN_EMAIL;
const adminPassword = process.env.NEXUS_ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  throw new Error('NEXUS_ADMIN_EMAIL and NEXUS_ADMIN_PASSWORD must be set.');
}

const adminLoginRes = await requestApi('POST', '/auth/login', {
  email: adminEmail,
  password: adminPassword
});
    const adminToken = adminLoginRes.data.data.token;
    
    // Find the pending admin request
    const pendingAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN', approvalStatus: 'PENDING' } });
    if (pendingAdmin) {
      console.log('Testing Admin approval...');
      const approveRes = await requestApi('PATCH', `/users/${pendingAdmin.id}/approve`, { approved: true }, adminToken);
      if (approveRes.status !== 200) {
        console.error('FAILURE: Failed to approve pending admin', approveRes.data);
        hasErrors = true;
      } else {
        const approvedUser = await prisma.user.findUnique({ where: { id: pendingAdmin.id } });
        if (approvedUser.status !== 'ACTIVE') {
          console.error(`FAILURE: Approved admin status is ${approvedUser.status}, expected ACTIVE`);
          hasErrors = true;
        } else {
          console.log('SUCCESS: Pending admin approved and status updated to ACTIVE');
        }
      }
    }

    if (hasErrors) console.log('\nResult: COMPLETED WITH ERRORS');
    else console.log('\nResult: COMPLETED SUCCESSFULLY');

  } catch (e) {
    console.error('Test crashed', e);
  } finally {
    await prisma.$disconnect();
  }
}
runTest();
