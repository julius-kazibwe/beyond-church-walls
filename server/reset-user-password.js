#!/usr/bin/env node

// Script to reset a user's password
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const usersDir = path.join(__dirname, 'data', 'users');
const usersIndexFile = path.join(usersDir, 'index.json');

async function resetPassword() {
  try {
    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
      console.log('Usage: node reset-user-password.js <email> <new-password>');
      console.log('\nExample:');
      console.log('  node reset-user-password.js user@example.com newpassword123');
      process.exit(1);
    }

    // Read user index
    const indexData = await fs.readFile(usersIndexFile, 'utf8');
    const index = JSON.parse(indexData);
    
    const userEntry = index.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!userEntry) {
      console.log(`❌ User with email ${email} not found.`);
      console.log('\nAvailable users:');
      index.users.forEach(u => console.log(`  - ${u.email}`));
      process.exit(1);
    }

    // Read user file
    const userFile = path.join(usersDir, `${userEntry.id}.json`);
    const userData = await fs.readFile(userFile, 'utf8');
    const user = JSON.parse(userData);

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Save user file
    await fs.writeFile(userFile, JSON.stringify(user, null, 2));

    console.log(`✅ Password reset successfully for ${email}`);
    console.log(`   New password: ${newPassword}`);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
}

resetPassword();

