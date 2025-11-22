# Admin Dashboard Credentials

## Test Admin Accounts

The following admin accounts have been created for testing:

### Admin Account 1
- **Email:** `admin@beyondchurchwalls.com`
- **Password:** `admin123`

### Admin Account 2
- **Email:** `admin1@test.com`
- **Password:** `admin123`

### Admin Account 3
- **Email:** `admin2@test.com`
- **Password:** `admin123`

### Admin Account 4
- **Email:** `test@admin.com`
- **Password:** `test123`

## How to Access

1. Navigate to: `http://localhost:5173/admin` (or your domain + `/admin`)
2. Enter any of the credentials above
3. You'll have full access to the admin dashboard

## Security Note

⚠️ **IMPORTANT:** These are test accounts with simple passwords. 

**Before deploying to production:**
1. Delete the test admin accounts
2. Set strong passwords in `server/.env`:
   ```
   ADMIN_EMAIL=your-secure-email@example.com
   ADMIN_PASSWORD=your-very-secure-password-here
   ```
3. Delete `server/data/admins.json` and restart the server
4. Or use the password reset script to change individual admin passwords

## Managing Admin Accounts

### List all admins:
```bash
cd server
node list-admins.js
```

### Reset admin password:
```bash
cd server
node reset-admin-password.js <email> <new-password>
```

### Create new test admins:
```bash
cd server
node create-test-admins.js
```

