#!/usr/bin/env node

// Quick script to check if the server has the auth endpoints
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/health',
  method: 'GET',
};

console.log('Checking if server is running on port 3001...\n');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✓ Server is running');
      console.log('  Response:', data);
      
      // Now check if auth endpoint exists
      checkAuthEndpoint();
    } else {
      console.log('✗ Server returned status:', res.statusCode);
    }
  });
});

req.on('error', (e) => {
  console.error('✗ Cannot connect to server on port 3001');
  console.error('  Error:', e.message);
  console.log('\nPlease make sure the server is running:');
  console.log('  cd server && npm start');
  process.exit(1);
});

req.end();

function checkAuthEndpoint() {
  const authOptions = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/signup',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  console.log('\nChecking if auth endpoints exist...\n');

  const authReq = http.request(authOptions, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      const contentType = res.headers['content-type'] || '';
      
      if (contentType.includes('application/json')) {
        console.log('✓ Auth endpoints are available');
        try {
          const json = JSON.parse(data);
          if (json.error) {
            console.log('  Response:', json.error);
            console.log('  (This is expected - endpoint exists but validation failed)');
          }
        } catch (e) {
          console.log('  Response:', data.substring(0, 100));
        }
      } else if (data.includes('Cannot POST') || data.includes('<!DOCTYPE')) {
        console.log('✗ Auth endpoints NOT found');
        console.log('  The server is running old code without auth endpoints.');
        console.log('\nPlease restart the server:');
        console.log('  1. Stop the server (Ctrl+C)');
        console.log('  2. Restart: cd server && npm start');
      } else {
        console.log('  Unexpected response:', data.substring(0, 100));
      }
    });
  });

  authReq.on('error', (e) => {
    console.error('  Error checking auth endpoint:', e.message);
  });

  // Send a test request (will fail validation, but endpoint should exist)
  authReq.write(JSON.stringify({ email: '', password: '', name: '' }));
  authReq.end();
}

