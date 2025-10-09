# Lunaris - Local Testing Guide

## 🚀 Server Status
A local HTTP server has been started on port 8000!

## 📝 Access Points

### Main Application
- **Home Page**: http://localhost:8000/index.html
- **Dashboard**: http://localhost:8000/Learning%20JS/dashboard.html
- **Console**: http://localhost:8000/Learning%20JS/console.html
- **Admin Panel**: http://localhost:8000/Learning%20JS/admin.html

## 🧪 Test Checklist

### 1. Wallet Modal Testing
- [ ] Go to Dashboard (http://localhost:8000/Learning%20JS/dashboard.html)
- [ ] Click the "👛 Wallet" button in the header
- [ ] Verify wallet modal opens
- [ ] Check if wallet address is displayed correctly
- [ ] Check if SOL balance loads
- [ ] Test "Copy Address" button
- [ ] Switch to "📤 Send" tab
- [ ] Switch to "📥 Receive" tab
- [ ] Verify QR code is generated
- [ ] Test refresh balance button

### 2. Admin Gear Icon Testing
- [ ] Go to Console (http://localhost:8000/Learning%20JS/console.html)
- [ ] Sign in with admin account (beautifulshameless@gmail.com)
- [ ] Check if gear icon (⚙️) appears in bottom-right corner
- [ ] Click gear icon to verify it goes to admin dashboard

### 3. Updated Jupiter Logo Testing
- [ ] Go to Home Page (http://localhost:8000/index.html)
- [ ] Click "Sign in with Wallet"
- [ ] Verify Jupiter logo is teal/cyan colored (not orange)
- [ ] Check all wallet logos look correct:
  - Phantom: Purple ghost
  - Solflare: Orange/yellow flames
  - Jupiter: Teal cat astronaut
  - WalletConnect: Blue bridge icon

## 🔧 Firebase Admin Setup (IMPORTANT - Read This!)

### How to Enable Admin Access & See the Gear Icon

The admin gear icon (⚙️) only shows if you're marked as an admin in Firebase. Here's how to set it up:

#### Step 1: Find Your UID (User ID)

**Method A - From Console Page:**
1. Open http://localhost:8000/Learning%20JS/console.html
2. Sign in with your Google account (beautifulshameless@gmail.com)
3. Open browser DevTools (Press F12)
4. Go to the **Console** tab
5. Look for a message like: `Checking admin status for user: AbCd1234XyZ...`
6. **Copy your UID** (the long string after "user:")

**Method B - From Any Page (After Sign-in):**
1. Sign in with your Google account
2. Open browser DevTools (F12) → Console tab
3. Type: `firebase.auth().currentUser.uid` and press Enter
4. Copy the UID that appears

#### Step 2: Add Yourself as Admin in Firebase

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your **"lunaris-45d84"** project
3. Click **Realtime Database** in the left sidebar (NOT Firestore!)
4. You'll see the database with a root node

**Option 1: If "admins" node doesn't exist:**
1. Hover over the root and click the **+ icon**
2. Enter `admins` for Name, then press Tab
3. For Value, enter `{}`
4. Click **Add**
5. Now hover over `admins` and click the **+ icon** again
6. Enter your UID (from Step 1) for Name
7. For Value, create an object like this:
   ```json
   {
     "email": "beautifulshameless@gmail.com",
     "addedAt": 1234567890,
     "addedBy": "system"
   }
   ```
8. Click **Add**

**Option 2: If "admins" node already exists:**
1. Hover over `admins` and click the **+ icon**
2. Enter your UID (from Step 1) for Name
3. For Value, use the same JSON object as above
4. Click **Add**

**Your Firebase structure should look like this:**
```
root
└── admins
    └── YOUR_UID_HERE
        ├── email: "beautifulshameless@gmail.com"
        ├── addedAt: 1234567890
        └── addedBy: "system"
```

**Quick Method (Alternative):**
You can also just set:
```
admins
└── YOUR_UID: true
```
This simpler structure also works!

#### Step 3: Test Admin Access

1. Refresh any page where you're signed in (F5)
2. The gear icon (⚙️) should now appear in the bottom-right corner of:
   - Console page
   - Dashboard page
   - Chatroom page
3. Click it to access the admin dashboard!
4. If it works, you'll see the admin dashboard with:
   - Admin management section
   - Task limits & rules configuration

**Troubleshooting:**

- **Icon still doesn't show:**
  - Open browser console (F12) and look for "Admin access granted" message
  - If you see "User is not an admin", your UID doesn't match
  - Clear browser cache (Ctrl+Shift+Delete) and hard refresh (Ctrl+F5)
  - Make sure you added the UID exactly (case-sensitive!)

- **Can't access admin.html directly:**
  - The admin dashboard automatically redirects if you're not an admin
  - You MUST be signed in AND have your UID in the `admins` node

- **To verify your UID matches:**
  1. Sign in to the app
  2. Open console (F12)
  3. Type: `localStorage.getItem('currentUser')` and press Enter
  4. Look for `"uid":"YOUR_UID_HERE"`
  5. This MUST match what's in Firebase `admins` node

## 🛑 Stop Server

When done testing, stop the server with:
```bash
# Find the process
netstat -ano | findstr :8000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

Or simply close the terminal/command prompt window.

## 🐛 Common Issues

### Name Change Issues
- **Name doesn't update**: Check browser console (F12) for errors
- **"Failed to update name"**: Your user profile may not exist in Firebase yet
- **Fix**: The name change now uses `set` instead of `update`, so it should work first time
- **Verify**: Check Firebase Realtime Database → user-profiles → your UID → displayName

### Wallet Modal Issues
- **Modal doesn't appear**: Click the "👛 Wallet" button in the dashboard header
- **Modal won't close**: Click the X button or click outside the modal
- **No wallet address**: Make sure you're signed in with Google (app creates wallet automatically)
- **Balance shows 0.00**: This is normal for new wallets on devnet (no funds yet)
- **Send not working**: App-created wallets can only receive; connect Phantom wallet extension to send
- **QR code not showing**: Check internet connection (QR code is generated via API)

### Admin Gear Icon Issues
- **Icon not showing**: Follow the Firebase Admin Setup steps above
- **UID not found**: Open browser console, your UID will be printed there
- **Still not showing**: Clear browser cache (Ctrl+Shift+Delete) and hard refresh (Ctrl+F5)
- **Wrong page**: The gear icon only shows on the Console page, not Dashboard or Home

## 📊 Expected Behavior

✅ **Wallet Modal Should:**
- Open when clicking "👛 Wallet" button
- Display your Solana wallet address
- Show SOL balance (likely 0.00 on devnet for new wallets)
- Allow copying address
- Generate QR code for receiving
- Allow sending SOL (only with connected Phantom wallet)

✅ **Admin Gear Icon Should:**
- Only appear for admin users in Console page
- Float in bottom-right corner
- Link to admin dashboard when clicked

✅ **Jupiter Logo Should:**
- Be teal/cyan color (#19FB9B)
- Show cat astronaut design
- Not be orange/yellow
