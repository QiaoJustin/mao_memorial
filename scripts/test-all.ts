import http from 'http';

const pages = [
  '/',
  '/timeline',
  '/photos',
  '/search',
  '/admin/login',
  '/admin/dashboard',
  '/admin/nodes',
];

const apis = [
  '/api/v1/eras',
  '/api/v1/timeline?page=1&pageSize=5',
  '/api/v1/photos?page=1&pageSize=5',
];

async function testPages() {
  console.log('=== Testing Pages ===');
  const results: { url: string; status: number; success: boolean }[] = [];
  
  for (const url of pages) {
    await new Promise((resolve) => {
      const req = http.request({
        hostname: 'localhost',
        port: 3000,
        path: url,
        method: 'GET',
      }, (res) => {
        const success = res.statusCode === 200;
        results.push({ url, status: res.statusCode!, success });
        console.log(`${success ? '✓' : '✗'} ${url}: ${res.statusCode}`);
        resolve(null);
      });
      req.on('error', () => {
        results.push({ url, status: 0, success: false });
        console.log(`✗ ${url}: Connection error`);
        resolve(null);
      });
      req.end();
    });
  }
  
  return results;
}

async function testApis() {
  console.log('\n=== Testing APIs ===');
  const results: { url: string; status: number; success: boolean }[] = [];
  
  for (const url of apis) {
    await new Promise((resolve) => {
      const req = http.request({
        hostname: 'localhost',
        port: 3000,
        path: url,
        method: 'GET',
      }, (res) => {
        const success = res.statusCode === 200;
        results.push({ url, status: res.statusCode!, success });
        console.log(`${success ? '✓' : '✗'} ${url}: ${res.statusCode}`);
        resolve(null);
      });
      req.on('error', () => {
        results.push({ url, status: 0, success: false });
        console.log(`✗ ${url}: Connection error`);
        resolve(null);
      });
      req.end();
    });
  }
  
  return results;
}

async function testAdminApiWithAuth() {
  console.log('\n=== Testing Admin APIs with Auth ===');
  
  const loginResult = await new Promise<{ success: boolean; token: string | null }>((resolve) => {
    const data = JSON.stringify({ username: 'admin', password: 'admin123' });
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          const success = json.code === 200;
          resolve({ success, token: success ? json.data.token : null });
        } catch {
          resolve({ success: false, token: null });
        }
      });
    });
    req.on('error', () => resolve({ success: false, token: null }));
    req.write(data);
    req.end();
  });
  
  if (!loginResult.success || !loginResult.token) {
    console.log('✗ Login failed');
    return [];
  }
  
  console.log('✓ Login successful');
  
  const adminApis = [
    '/api/v1/admin/nodes?page=1&pageSize=5',
    '/api/v1/admin/stats/dashboard',
  ];
  
  const results: { url: string; status: number; success: boolean }[] = [];
  
  for (const url of adminApis) {
    await new Promise((resolve) => {
      const req = http.request({
        hostname: 'localhost',
        port: 3000,
        path: url,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${loginResult.token}`,
        },
      }, (res) => {
        const success = res.statusCode === 200;
        results.push({ url, status: res.statusCode!, success });
        console.log(`${success ? '✓' : '✗'} ${url}: ${res.statusCode}`);
        resolve(null);
      });
      req.on('error', () => {
        results.push({ url, status: 0, success: false });
        console.log(`✗ ${url}: Connection error`);
        resolve(null);
      });
      req.end();
    });
  }
  
  return results;
}

async function main() {
  console.log('=== Full System Test ===\n');
  
  const pageResults = await testPages();
  const apiResults = await testApis();
  const adminApiResults = await testAdminApiWithAuth();
  
  const allResults = [...pageResults, ...apiResults, ...adminApiResults];
  const successCount = allResults.filter(r => r.success).length;
  const totalCount = allResults.length;
  
  console.log(`\n=== Summary ===`);
  console.log(`Total: ${totalCount}, Success: ${successCount}, Failed: ${totalCount - successCount}`);
  
  if (successCount === totalCount) {
    console.log('✅ All tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed!');
    process.exit(1);
  }
}

main();