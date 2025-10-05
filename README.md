# Lunaris - Mars Colony Web App

A futuristic web application for Mars colony sign-ups with animated text effects and Firebase Google authentication.

## 🚀 Features

- **Flowing Text Animations**:
  - Typing effect on main title
  - Wave animation on headlines
  - Fade-in and slide-up effects on content
- **Firebase Google Authentication**: Sign in with your Google account
- **Responsive Design**: Works on desktop and mobile devices

## 📝 How the Text Animations Work

### 1. **Typing Animation** (index.html:124-137)
```javascript
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}
```
- **How it works**: Uses `setTimeout()` to add one character at a time
- **Parameters**:
  - `element`: The HTML element to animate
  - `text`: The text to display
  - `speed`: Milliseconds between each character (default: 100ms)
- **Customization**: Change the `speed` value to make it faster or slower

### 2. **Wave Animation** (index.html:140-153)
```javascript
function createWaveText(element) {
    const text = element.textContent;
    element.innerHTML = '';

    text.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.display = 'inline-block';
        span.style.animation = `wave 1s ease-in-out infinite`;
        span.style.animationDelay = `${index * 0.1}s`;
        element.appendChild(span);
    });
}
```
- **How it works**: Splits text into individual letters, wraps each in a `<span>`, then applies staggered animation
- **CSS Animation** (index.css:48-55):
```css
@keyframes wave {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}
```

### 3. **Fade-In-Up Animation** (index.css:31-45)
- **HTML**: Add class `fade-in-up` to any element
- **Delay**: Use `style="animation-delay: 1s;"` to stagger animations
- **How it works**: CSS keyframes move element from below (30px down) while fading in

## 🔥 Firebase Setup Instructions

### Step 1: Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "lunaris-app")
4. Disable Google Analytics (optional)
5. Click "Create project"

### Step 2: Register Your Web App
1. In your Firebase project, click the **Web icon** (`</>`)
2. Enter app nickname: "Lunaris Web App"
3. Click "Register app"
4. **Copy the Firebase configuration object** - you'll need this!

### Step 3: Enable Google Authentication
1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click on **Google**
3. Toggle **Enable**
4. Select a support email
5. Click **Save**

### Step 4: Set Up Firestore Database
1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode** (we'll add rules next)
4. Select a location close to your users
5. Click **Enable**

### Step 5: Configure Firestore Security Rules
1. In Firestore Database, go to **Rules** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own notes
    match /notes/{noteId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

3. Click **Publish**

### Step 6: Create a Composite Index
**Important:** For the notes app to work, you need to create a composite index.

1. In Firestore, go to **Indexes** tab
2. Click **Create Index**
3. Collection ID: `notes`
4. Add two fields:
   - Field path: `userId`, Order: Ascending
   - Field path: `createdAt`, Order: Descending
5. Click **Create**
6. Wait for the index to build (usually 1-2 minutes)

**Alternative:** Just try using the notes app - Firebase will show an error with a direct link to create the index automatically!

### Step 7: Set Up Realtime Database (for Sign-Ups)
**For storing Mars colony sign-ups:**

1. In Firebase Console, go to **Realtime Database** (different from Firestore!)
2. Click **Create Database**
3. Choose a location
4. Start in **test mode** (we'll add rules next)
5. Click **Enable**

### Step 8: Configure Realtime Database Security Rules
1. In Realtime Database, go to **Rules** tab
2. Replace the rules with:

```json
{
  "rules": {
    "colony-signups": {
      ".read": "auth != null",
      ".write": true,
      "$signupId": {
        ".validate": "newData.hasChildren(['name', 'age', 'email', 'gender', 'signedUpAt', 'status'])"
      }
    }
  }
}
```

3. Click **Publish**

**What these rules do:**
- Allow anyone to submit a sign-up (`.write: true`)
- Only authenticated users can read sign-ups
- Validates that all required fields are present

### Step 9: Get Your Realtime Database URL
1. In Realtime Database, look at the top of the page
2. Copy the URL (looks like `https://your-project-default-rtdb.firebaseio.com`)
3. It's already added to your config in `index.html` line 89!

### Step 10: Add Your Firebase Config (Already Done! ✅)
Your Firebase configuration is already set up in both `index.html` and `notes.html`. The config is shared across your entire app.

### Step 11: Test Your App
1. Open `index.html` in a browser
2. Fill in the Mars colony sign-up form (name, age, email, gender)
3. Click **"Sign Up for Colony"**
4. You should see a success message!
5. Check Firebase Realtime Database to see your sign-up data
6. Or click **"Sign in with Google"** for Google authentication
7. Click "📝 My Notes" to go to your notes page
8. Create a note and it will be saved to Firestore!

## 🛠️ Customizing Animations

### Change Typing Speed
In `index.html` line 159, change the speed value (in milliseconds):
```javascript
typeWriter(typingElement, 'Lunaris (Test Javascript App)', 50); // Faster (50ms)
typeWriter(typingElement, 'Lunaris (Test Javascript App)', 150); // Slower (150ms)
```

### Change Wave Animation
In `index.css` line 49, adjust the wave height:
```css
@keyframes wave {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); } /* Higher bounce */
}
```

### Change Fade-In Speed
In `index.css` line 33, adjust animation duration:
```css
.fade-in-up {
    opacity: 0;
    animation: fadeInUp 1.5s ease-out forwards; /* Slower fade */
}
```

### Add Animation to New Elements
Simply add the class to any HTML element:
```html
<div class="fade-in-up" style="animation-delay: 3s;">
    <h2>This will fade in after 3 seconds!</h2>
</div>
```

## 📁 Project Structure

```
js-/
├── index.html              # Main landing page with animations & sign-up form
├── Learning JS/
│   ├── index.css          # Styles and animation keyframes
│   ├── index.js           # Additional JavaScript functionality
│   ├── console.html       # Console page
│   └── notes.html         # Notes application with Firebase auth
└── README.md              # This file (you're reading it!)
```

## 🔥 Firebase Architecture

This project uses **two different Firebase databases**:

### 1. **Realtime Database** - for Mars Colony Sign-Ups
- Path: `/colony-signups`
- Public writes (anyone can sign up)
- Auth-required reads
- Real-time synchronization
- Simple key-value structure

### 2. **Firestore** - for Personal Notes
- Collection: `notes`
- User-specific data (filtered by `userId`)
- Advanced querying & indexing
- Document-based structure
- Security rules enforce user isolation

## 🔒 Security Note

⚠️ **Important**: Never commit your actual Firebase API keys to public repositories. Consider using environment variables or Firebase hosting for production apps.

## 📚 Learn More

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [CSS Animations Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
- [JavaScript setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout)

## 🚀 Mars Colony Sign-Up & Role Selection Flow

### Complete User Journey

1. **Sign Up** (index.html) → Collects user info
2. **Redirect** → Auto-redirects to console.html
3. **Role Selection** (console.html) → User picks their colony role
4. **Role Perks** → Applied across entire app

### How Sign-Ups Are Stored

Sign-ups are saved to **Firebase Realtime Database** at the path `/colony-signups`.

**Code Implementation** (index.html:158-213):
```javascript
// Create a new reference in the 'colony-signups' path
const signupsRef = ref(database, 'colony-signups');
const newSignupRef = push(signupsRef);  // ← Generates unique ID

// Save sign-up data
await set(newSignupRef, {
    name: name,
    age: parseInt(age),
    email: email,
    gender: gender,
    signedUpAt: serverTimestamp(),  // ← Server timestamp
    status: 'pending'
});
```

### Data Structure in Realtime Database
```json
{
  "colony-signups": {
    "-NxAbCdEfGhIjKlM": {
      "name": "John Doe",
      "age": 28,
      "email": "john@example.com",
      "gender": "Male",
      "signedUpAt": 1704067200000,
      "status": "pending"
    },
    "-NxAbCdEfGhIjKlN": {
      "name": "Jane Smith",
      "age": 32,
      "email": "jane@example.com",
      "gender": "Female",
      "signedUpAt": 1704067300000,
      "status": "pending"
    }
  }
}
```

### Form Validation (index.html:165-182)
- **Required Fields**: All fields must be filled
- **Email Format**: Validated with regex pattern
- **Age Range**: Must be 18-100 years old
- **Success Feedback**: Shows personalized message and clears form

### Viewing Sign-Ups
To view all sign-ups in Firebase Console:
1. Go to **Realtime Database**
2. Navigate to `/colony-signups`
3. You'll see all sign-ups with their unique IDs and selected roles

## 🎭 Role Selection System

### How Roles Work

After signing up, users are automatically redirected to the **console page** where they select a colony role. Each role has unique lore and gameplay perks.

### Role Data Structure (console.html:160-231)

```javascript
const ROLES = {
    'option1': {
        name: 'Base Engineer',
        emoji: '🔧',
        lore: 'Responsible for keeping habitats safe...',
        perks: {
            efficiency: 1.10,  // +10% efficiency
            dailyBonus: 'oxygen',
            specialUnlock: 'Habitat Module Skins'
        }
    },
    // ... 7 roles total
};
```

### Available Roles & Perks

1. **🔧 Base Engineer**
   - +10% efficiency on base upgrades
   - Daily oxygen bonus
   - Unlocks: Habitat Module Skins

2. **🛰️ Exploratory Engineer**
   - +5% Lunaris earned from exploration
   - Early access: Red Dunes Zone
   - Unlocks: Martian Mineral NFTs

3. **🌱 Food Tech Expert**
   - +10% yield from wellness tasks
   - Daily hydroponics tokens
   - Unlocks: Rare Crop Recipes

4. **📡 Comms Specialist**
   - +5% staking rewards
   - Colony-wide broadcasts
   - Unlocks: Holographic Badges

5. **⛏️ Resource Miner**
   - +15% mining efficiency
   - Bonus NFT drops
   - Unlocks: Crater Nexus Deals

6. **🩺 Medical Officer**
   - +5% wellness task bonus
   - Can heal other colonists
   - Unlocks: Medical Pods

7. **🌌 Navigator**
   - 15% faster quests
   - Fast travel unlocked
   - +10% streak bonus

### Role Storage System

**Firebase Storage** (console.html:317-326):
```javascript
// Saves to Firebase Realtime Database
const userRef = ref(database, `colony-signups/${currentUser.signupId}`);
await update(userRef, {
    role: roleValue,
    roleName: roleData.name,
    roleSelectedAt: Date.now()
});
```

**LocalStorage** (console.html:328-339):
```javascript
// Saves to localStorage for quick access
const roleInfo = {
    value: roleValue,
    name: roleData.name,
    emoji: roleData.emoji,
    lore: roleData.lore,
    perks: roleData.perks,
    selectedAt: Date.now()
};
localStorage.setItem('userRole', JSON.stringify(roleInfo));
```

### Accessing Role Data Across The App

**Global Functions** (console.html:383-395):

```javascript
// Get current user's role
const role = window.getUserRole();
console.log(role.name);  // "Base Engineer"
console.log(role.perks); // { efficiency: 1.10, ... }

// Apply role perks to calculations
const baseReward = 100;
const bonusReward = window.applyRolePerks(baseReward, 'efficiency');
// If user is Base Engineer: bonusReward = 110 (100 * 1.10)
```

### Example: Applying Perks in Your Todo App

```javascript
// In your productivity/todo app:
const role = window.getUserRole();

if (role && role.perks.taskYield) {
    // Food Tech Expert gets +10% yield
    const basePoints = 10;
    const bonusPoints = basePoints * role.perks.taskYield;  // 11 points
}

if (role && role.perks.streakBonus) {
    // Navigator gets +10% streak bonus
    const streakMultiplier = role.perks.streakBonus;  // 1.10
}
```

## 📝 Notes App Features

### User-Specific Data Isolation
Each user only sees their own notes! Here's how it works:

**When saving a note** (notes.html:779-786):
```javascript
await addDoc(collection(db, 'notes'), {
    userId: currentUser.uid,  // ← Stores the user's unique ID
    title,
    category,
    content,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
});
```

**When loading notes** (notes.html:587-591):
```javascript
const q = query(
    collection(db, 'notes'),
    where('userId', '==', currentUser.uid),  // ← Only gets THIS user's notes
    orderBy('createdAt', 'desc')
);
```

### How Authentication Protects Your Notes

1. **Login Required**: You must sign in with Google to access notes
2. **User ID Filtering**: All database queries filter by `userId`
3. **Firestore Security Rules**: Server-side rules prevent unauthorized access
4. **Auth State Monitoring**: Automatically signs you out if session expires

### Data Structure
Each note in Firestore looks like:
```javascript
{
  userId: "abc123...",           // Google user ID
  title: "My Note",
  category: "spirituality",      // spirituality, music, life, or love
  content: "Note content...",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## 🔐 Privacy & Security

- **Google Authentication**: Secure OAuth 2.0 sign-in
- **Firestore Security Rules**: Notes can only be accessed by their owner
- **No Data Sharing**: Your notes are private and never shared
- **Client-Side Encryption**: Data encrypted in transit (HTTPS)

## 🎨 Future Enhancements

- Add more animation types (rotate, scale, bounce)
- Add email/password authentication option
- Rich text editor for notes (bold, italic, lists)
- Search and filter notes
- Export notes to PDF/Markdown
- Note sharing with other users (optional)
- Dark mode toggle
