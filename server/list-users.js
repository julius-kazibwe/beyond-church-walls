#!/usr/bin/env node

// Script to list all users
const fs = require('fs').promises;
const path = require('path');

const usersDir = path.join(__dirname, 'data', 'users');
const usersIndexFile = path.join(usersDir, 'index.json');

async function listUsers() {
  try {
    const indexData = await fs.readFile(usersIndexFile, 'utf8');
    const index = JSON.parse(indexData);
    
    if (index.users.length === 0) {
      console.log('No users found. Users need to sign up first.');
      return;
    }

    console.log('Registered Users:');
    console.log('==================\n');
    
    for (const userEntry of index.users) {
      try {
        const userFile = path.join(usersDir, `${userEntry.id}.json`);
        const userData = await fs.readFile(userFile, 'utf8');
        const user = JSON.parse(userData);
        
        console.log(`Email: ${user.email}`);
        console.log(`Name: ${user.name || 'N/A'}`);
        console.log(`Created: ${new Date(user.createdAt).toLocaleString()}`);
        console.log(`Last Login: ${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}`);
        console.log('---');
      } catch (e) {
        console.log(`Error reading user ${userEntry.id}:`, e.message);
      }
    }
    
    console.log(`\nTotal: ${index.users.length} user(s)`);
    console.log('\nTo reset a password, run:');
    console.log('  node reset-user-password.js <email> <new-password>');
  } catch (error) {
    console.error('Error listing users:', error);
  }
}

listUsers();

