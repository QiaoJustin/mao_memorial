import http from 'http';

async function login(): Promise<string | null> {
  return new Promise((resolve) => {
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
          if (json.code === 200 && json.data.token) {
            resolve(json.data.token);
          } else {
            console.log('Login failed:', json.message);
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      });
    });
    
    req.on('error', () => resolve(null));
    req.write(data);
    req.end();
  });
}

async function getNodes(token: string) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/admin/nodes?page=1&pageSize=5',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          console.log('API Status:', res.statusCode);
          console.log('Code:', json.code);
          console.log('Total:', json.data?.total);
          console.log('TotalPages:', json.data?.totalPages);
          console.log('List length:', json.data?.list?.length);
          if (json.data?.list?.length > 0) {
            console.log('First node:', json.data.list[0].title);
          }
          console.log('\nFull response:', JSON.stringify(json, (key, value) => {
            if (typeof value === 'bigint') return value.toString();
            return value;
          }, 2).substring(0, 1000));
          resolve(json);
        } catch (e) {
          console.log('Parse error:', e);
          console.log('Response:', body.substring(0, 1000));
          resolve(null);
        }
      });
    });
    
    req.on('error', (e) => console.log('Error:', e));
    req.end();
  });
}

async function main() {
  console.log('Testing admin API...\n');
  
  console.log('1. Login...');
  const token = await login();
  
  if (!token) {
    console.log('Login failed!');
    return;
  }
  
  console.log('Login successful!\n');
  
  console.log('2. Get nodes...');
  await getNodes(token);
  
  console.log('\nTest completed!');
}

main();