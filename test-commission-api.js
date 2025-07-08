// Simple test script to verify commission API
// Using built-in fetch (Node.js 18+)

async function testCommissionAPI() {
  try {
    // First login to get token
    console.log('Logging in...');
    const loginResponse = await fetch('http://localhost:3004/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('Login successful, token received');

    // Test commission stats API
    console.log('Testing commission stats API...');
    const statsResponse = await fetch('http://localhost:3004/api/commissions/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cookie': `auth-token=${token}`
      }
    });

    console.log('Stats response status:', statsResponse.status);
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('Commission stats:', JSON.stringify(statsData, null, 2));
    } else {
      const errorText = await statsResponse.text();
      console.log('Stats error:', errorText);
    }

    // Test commission list API
    console.log('Testing commission list API...');
    const listResponse = await fetch('http://localhost:3004/api/commissions', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cookie': `auth-token=${token}`
      }
    });

    console.log('List response status:', listResponse.status);
    
    if (listResponse.ok) {
      const listData = await listResponse.json();
      console.log('Commission list:', JSON.stringify(listData, null, 2));
    } else {
      const errorText = await listResponse.text();
      console.log('List error:', errorText);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCommissionAPI();
