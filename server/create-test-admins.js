#!/usr/bin/env node

// Script to create multiple test admin accounts
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const adminFile = path.join(__dirname, 'data', 'admin.json');
const adminsFile = path.join(__dirname, 'data', 'admins.json'); // Multiple admins

async function createTestAdmins() {
  try {
    // Ensure data directory exists
    const dataDir = path.join(__dirname, 'data');
    await fs.mkdir(dataDir, { recursive: true });

    // Test admin accounts to create
    const testAdmins = [
      {
        email: 'admin@beyondchurchwalls.com',
        password: 'admin123',
        name: 'Main Admin'
      },
      {
        email: 'admin1@test.com',
        password: 'admin123',
        name: 'Test Admin 1'
      },
      {
        email: 'admin2@test.com',
        password: 'admin123',
        name: 'Test Admin 2'
      },
      {
        email: 'test@admin.com',
        password: 'test123',
        name: 'Test Admin'
      }
    ];

    // Check if admins file exists
    let admins = [];
    try {
      const existingData = await fs.readFile(adminsFile, 'utf8');
      admins = JSON.parse(existingData);
    } catch {
      // File doesn't exist, start fresh
    }

    console.log('Creating test admin accounts...\n');

    for (const adminData of testAdmins) {
      // Check if admin already exists
      const existing = admins.find(a => a.email.toLowerCase() === adminData.email.toLowerCase());
      
      if (existing) {
        console.log(`⚠️  Admin ${adminData.email} already exists. Skipping.`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      
      const admin = {
        email: adminData.email,
        password: hashedPassword,
        name: adminData.name,
        createdAt: new Date().toISOString(),
        lastLogin: null
      };

      admins.push(admin);
      console.log(`✅ Created admin: ${adminData.email} / ${adminData.password}`);
    }

    // Save all admins
    await fs.writeFile(adminsFile, JSON.stringify(admins, null, 2));

    console.log('\n📋 Test Admin Accounts:');
    console.log('======================\n');
    testAdmins.forEach(admin => {
      console.log(`Email: ${admin.email}`);
      console.log(`Password: ${admin.password}`);
      console.log('---');
    });

    console.log('\n⚠️  IMPORTANT: These are test accounts. Change passwords in production!');
  } catch (error) {
    console.error('Error creating test admins:', error);
    process.exit(1);
  }
}

createTestAdmins();

