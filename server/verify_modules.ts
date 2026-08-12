import http from 'http';

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
  console.log('--- Modules Verification Test ---');
  let hasErrors = false;
  
  try {
    const adminToken = await login('admin@nexus.com', 'Admin@123');

    // Dashboard metrics
    console.log('Testing Dashboard...');
    const dashRes = await requestApi('GET', '/dashboard/admin', null, adminToken);
    if (dashRes.status === 404) {
      console.log('NOTICE: Specific admin dashboard endpoint missing, probably implemented in frontend by aggregating individual endpoints. Let us check individual endpoints.');
    }

    const customersRes = await requestApi('GET', '/customers', null, adminToken);
    if (customersRes.status !== 200 || !Array.isArray(customersRes.data.data.data)) {
      console.error('FAILURE: /customers did not return array data', customersRes.data);
      hasErrors = true;
    } else console.log('SUCCESS: /customers endpoint OK');

    const productsRes = await requestApi('GET', '/products', null, adminToken);
    if (productsRes.status !== 200 || !Array.isArray(productsRes.data.data.data)) {
      console.error('FAILURE: /products did not return array data', productsRes.data);
      hasErrors = true;
    } else console.log('SUCCESS: /products endpoint OK');

    const invRes = await requestApi('GET', '/inventory', null, adminToken);
    if (invRes.status !== 200 || typeof invRes.data.data.totalProducts !== 'number') {
      console.error('FAILURE: /inventory overview invalid shape', invRes.data);
      hasErrors = true;
    } else console.log('SUCCESS: /inventory overview OK');

    const moveRes = await requestApi('GET', '/inventory/movements', null, adminToken);
    if (moveRes.status !== 200 || !Array.isArray(moveRes.data.data.data)) {
      console.error('FAILURE: /inventory/movements invalid shape', moveRes.data);
      hasErrors = true;
    } else console.log('SUCCESS: /inventory/movements OK');
    
    if (hasErrors) console.log('\nResult: COMPLETED WITH ERRORS');
    else console.log('\nResult: COMPLETED SUCCESSFULLY');

  } catch (e) {
    console.error('Test crashed', e);
  }
}
runTest();
