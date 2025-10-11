# Mainnet Migration with Encrypted Wallets - Step by Step Guide

## ⚠️ CRITICAL SECURITY WARNINGS

**READ THIS CAREFULLY:**

1. **You are responsible for user funds** - If keys are compromised, users lose real money
2. **Backup everything** - Before starting, backup all Firebase data
3. **Test thoroughly** - Test on devnet first, then with small amounts on mainnet
4. **Legal disclaimer required** - Add terms of service about wallet custody risks
5. **Regular security audits** - Have code reviewed by security experts
6. **Insurance** - Consider getting insurance for stored funds
7. **Compliance** - Check if you need licenses to custody user funds in your jurisdiction

## 🛠️ Prerequisites Checklist

Before we start, you need:

### 1. Firebase Setup
- ✅ Firebase project created (you have this)
- ✅ Firebase Realtime Database enabled
- ✅ Firebase Storage enabled
- ✅ Firebase Remote Config enabled (we'll set this up)

### 2. Security Requirements
- [ ] Backup all Firebase data
- [ ] Read and understand encryption concepts below
- [ ] Prepare legal disclaimer text
- [ ] Set up error monitoring (optional but recommended)

### 3. Access & Permissions
- [ ] Admin access to Firebase Console
- [ ] Ability to add Environment Config in Firebase
- [ ] Ability to update Security Rules

### 4. Testing Resources
- [ ] Small amount of SOL for mainnet testing (~0.1 SOL = ~$15)
- [ ] Test account for verification
- [ ] Backup of devnet wallets (if you want to preserve them)

## 📚 Security Concepts (Simplified)

### What We're Doing:
1. **Encryption Key**: A secret "password" that locks/unlocks private keys
2. **AES-256-GCM**: Military-grade encryption algorithm (very secure)
3. **Salt & IV**: Random data that makes encryption unique each time
4. **Key Derivation**: Converting your master key into encryption keys

### Where Keys Are Stored:
- **Master Key**: Firebase Remote Config (encrypted, access-controlled)
- **Encrypted Private Keys**: Firebase Database (safe even if leaked)
- **Public Keys**: Firebase Database (not sensitive, can be public)

### Security Layers:
```
Layer 1: Firebase Authentication (only authenticated users)
Layer 2: Firebase Security Rules (only access own data)
Layer 3: AES-256-GCM Encryption (even if data leaks, unusable)
Layer 4: Master Key in Remote Config (separate from database)
```

## 🔐 Encryption Master Key

### What Is It?
A long, random string that encrypts all private keys. Like a master password.

### How to Generate:
We'll use a cryptographically secure random generator to create a 256-bit key.

### Where to Store:
**Firebase Remote Config** - This is:
- Separate from your database
- Access-controlled
- Encrypted by Google
- Not accessible to end users
- Can be rotated if needed

## 📝 Step-by-Step Implementation Plan

### Phase 1: Setup (30 minutes)
1. Generate master encryption key
2. Store key in Firebase Remote Config
3. Update Firebase Security Rules
4. Add encryption utilities to code

### Phase 2: Implementation (1 hour)
5. Update wallet generation (encrypt before saving)
6. Update wallet loading (decrypt when reading)
7. Add wallet decryption for transactions
8. Add error handling

### Phase 3: Network Switch (15 minutes)
9. Change devnet → mainnet URLs
10. Update UI labels
11. Add mainnet warnings

### Phase 4: Testing (30 minutes)
12. Test wallet creation
13. Test wallet loading
14. Test transactions
15. Verify encryption works

### Phase 5: Security (30 minutes)
16. Add legal disclaimers
17. Add backup instructions
18. Update documentation
19. Enable logging & monitoring

## 🎯 What We'll Build

### New Encryption Module
```javascript
// Encrypt a private key
encryptedKey = await encryptPrivateKey(privateKey, masterKey);

// Decrypt when needed
privateKey = await decryptPrivateKey(encryptedKey, masterKey);
```

### Updated Wallet Flow
```
User clicks "Generate Wallet"
  ↓
Generate Solana keypair (in memory)
  ↓
Extract private key
  ↓
ENCRYPT private key with master key
  ↓
Store encrypted key + public key in Firebase
  ↓
Clear private key from memory
  ↓
Show success to user
```

### Transaction Flow
```
User wants to send SOL
  ↓
Load encrypted private key from Firebase
  ↓
DECRYPT private key in memory
  ↓
Sign transaction
  ↓
Send transaction
  ↓
Clear decrypted key from memory immediately
```

## 🚨 Security Best Practices We'll Implement

1. **Never log private keys** (not even for debugging)
2. **Clear keys from memory** after use
3. **Use secure random** for all cryptographic operations
4. **Validate all inputs** before encryption/decryption
5. **Rate limit** wallet operations to prevent abuse
6. **Monitor** for suspicious activity
7. **Backup** encryption key securely offline
8. **Rotate keys** periodically (advanced)

## 📊 Cost Considerations

### Mainnet Costs:
- **Transaction fees**: ~0.000005 SOL per transaction (~$0.0008)
- **Rent**: ~0.00089088 SOL for accounts (~$0.14)
- **Your costs**: Need to fund transactions for users OR charge fees

### Development Costs:
- **Testing**: ~0.1-0.5 SOL for thorough testing (~$15-75)
- **Monitoring**: Free tier usually sufficient
- **Storage**: Firebase free tier should be enough

## 🔄 Rollback Plan

If something goes wrong:

1. **Keep devnet version** - Don't delete old code yet
2. **Gradual rollout** - Test with one user first
3. **Emergency switch** - Can switch back to devnet in code
4. **Data backup** - All wallets can be recovered from backup

## 📖 After Implementation

You'll need to:

1. **Create user documentation**
   - How to backup their wallet
   - How to export private key (if needed)
   - Security best practices

2. **Add to UI**
   - "⚠️ Mainnet - Real Money" warnings
   - Confirmation dialogs for transactions
   - Balance warnings

3. **Monitor**
   - Failed transactions
   - Encryption errors
   - Unusual activity

4. **Regular security**
   - Review access logs
   - Update dependencies
   - Rotate encryption key annually

## ⚖️ Legal Disclaimer Template

```
WALLET CUSTODY DISCLAIMER

By using the wallet feature, you acknowledge:

1. We store your private keys in encrypted form
2. You are responsible for keeping your account secure
3. We cannot recover your wallet if you lose access to your account
4. Transactions on the blockchain are irreversible
5. You are responsible for any taxes on transactions
6. This service is provided "as-is" without guarantees
7. We are not responsible for loss of funds due to:
   - User error
   - Compromised accounts
   - Software bugs
   - Network issues

IMPORTANT: Always backup your wallet and never share your account password.
```

## 🎓 Key Terms to Understand

- **Mainnet**: Real Solana network with real money
- **Devnet**: Test network with fake money
- **Private Key**: Secret key that controls a wallet (like a password)
- **Public Key**: Wallet address (safe to share)
- **Encryption**: Scrambling data so it's unreadable without the key
- **Master Key**: The key that encrypts all private keys
- **AES-256-GCM**: The encryption algorithm we'll use
- **Salt**: Random data that makes encryption unique
- **IV**: Initialization Vector - another random element for security

## 📞 Support Resources

- Solana Docs: https://docs.solana.com/
- Web Crypto API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
- Firebase Security: https://firebase.google.com/docs/rules
- Encryption Best Practices: https://cheatsheetseries.owasp.org/

---

## ✅ Ready to Start?

Once you've:
- [ ] Read and understood all warnings
- [ ] Backed up your Firebase data
- [ ] Reviewed the prerequisites
- [ ] Understand the basic concepts

We can proceed with implementation!

Next step: Generate the master encryption key and set up Firebase Remote Config.
