# 🔥 Nexus Crater - Firebase Integration Guide

## Overview

This guide explains how to integrate the Nexus Crater Firebase module into your existing Lunaris app pages.

---

## 📂 Files Created

1. **nexus-firebase-integration.js** - Core Firebase module with all database functions
2. **nexus-claim-station.html** - Daily claim station UI
3. **nexus-marketplace.html** - Marketplace trading system

---

## 🔧 Integration Steps

### Step 1: Update Firebase Security Rules

Add these rules to your Firebase Realtime Database:

```json
{
  "rules": {
    "nexus-daily-resources": {
      "$date": {
        ".read": true,
        ".write": "auth != null"
      }
    },
    "nexus-user-claims": {
      "$userId": {
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null && auth.uid == $userId"
      }
    },
    "nexus-marketplace-listings": {
      ".read": true,
      "$listingId": {
        ".write": "auth != null"
      }
    },
    "nexus-trade-history": {
      "$tradeId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "nexus-reputation": {
      "$userId": {
        ".read": true,
        ".write": "auth != null"
      }
    },
    "nexus-market-prices": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

---

### Step 2: Integrate Claim Station into Dashboard

**File**: `dashboard.html`

Add a navigation button:

```html
<a href="/Learning JS/nexus-claim-station.html" class="nav-btn">🎁 Daily Claims</a>
```

**File**: `nexus-claim-station.html`

Replace the script section with:

```html
<script type="module">
    import {
        initializeDailyResources,
        getDailyResourcesStatus,
        listenToDailyResources,
        claimDailyResource,
        hasUserClaimed
    } from './nexus-firebase-integration.js';

    let resourcesData = {};

    // Initialize on page load
    async function init() {
        await initializeDailyResources();
        await loadResourceStatus();
        setupRealtimeListeners();
    }

    // Load resource status
    async function loadResourceStatus() {
        resourcesData = await getDailyResourcesStatus();
        updateUI(resourcesData);
    }

    // Setup real-time listeners
    function setupRealtimeListeners() {
        listenToDailyResources((data) => {
            updateProgressBars(data);
        });
    }

    // Update UI with resource data
    function updateUI(resources) {
        Object.keys(resources).forEach(key => {
            const resource = resources[key];
            const card = document.querySelector(`[data-resource="${key}"]`);

            if (!card) return;

            const progressFill = card.querySelector('.progress-bar-fill');
            const progressRemaining = card.querySelector('.progress-remaining');
            const progressPercentage = card.querySelector('.progress-percentage');
            const button = card.querySelector('.claim-button');

            // Update progress
            progressRemaining.textContent = `${resource.remaining} / ${resource.totalAvailable} remaining`;
            progressPercentage.textContent = `${resource.percentage}% left`;
            progressFill.style.width = resource.percentage + '%';

            // Update urgency
            if (resource.soldOut) {
                card.classList.add('sold-out');
                button.className = 'claim-button sold-out';
                button.disabled = true;
                button.textContent = '❌ SOLD OUT';
            } else if (resource.percentage < 10) {
                card.classList.add('almost-gone');
                progressFill.classList.add('very-low');
                progressFill.textContent = '🔥 HURRY!';
            } else if (resource.percentage < 40) {
                progressFill.classList.add('low');
                progressFill.textContent = 'Going Fast!';
            }
        });
    }

    // Claim resource function
    window.claimResource = async function(resourceId) {
        try {
            const result = await claimDailyResource(resourceId);

            if (result.success) {
                alert(`✅ Success! You claimed ${result.amount} ${result.resourceType}!`);

                // Update button
                const card = document.querySelector(`[data-resource="${resourceId}"]`);
                const button = card.querySelector('.claim-button');
                button.className = 'claim-button claimed';
                button.disabled = true;
                button.textContent = '✅ Claimed Successfully!';

                // Reload status
                await loadResourceStatus();
            } else {
                if (result.error === 'already_claimed') {
                    alert('⚠️ You already claimed this resource today!');
                } else if (result.error === 'sold_out') {
                    alert('❌ Sorry! This resource is sold out. Try again tomorrow!');
                } else {
                    alert(`❌ Error: ${result.message}`);
                }
            }
        } catch (error) {
            console.error('Error claiming resource:', error);
            alert('❌ An error occurred. Please try again.');
        }
    };

    // Initialize on load
    init();
</script>
```

---

### Step 3: Integrate Marketplace

**File**: `dashboard.html`

Add navigation:

```html
<a href="/Learning JS/nexus-marketplace.html" class="nav-btn">💱 Marketplace</a>
```

**File**: `nexus-marketplace.html`

Replace the script section with:

```html
<script type="module">
    import {
        getMarketplaceListings,
        createMarketplaceListing,
        purchaseFromMarketplace,
        cancelMarketplaceListing,
        getUserListings,
        getMarketPrices,
        listenToMarketPrices,
        getUserReputation
    } from './nexus-firebase-integration.js';

    // Load marketplace data
    async function loadMarketplace() {
        // Load listings
        const listings = await getMarketplaceListings();
        renderListings(listings);

        // Load prices
        const prices = await getMarketPrices();
        updatePriceTicker(prices);

        // Setup real-time price updates
        listenToMarketPrices((prices) => {
            updatePriceTicker(prices);
        });

        // Load user's listings
        const userListings = await getUserListings();
        renderUserListings(userListings);
    }

    // Render listings
    function renderListings(listings) {
        const container = document.getElementById('buy-listings');
        container.innerHTML = '';

        listings.forEach(listing => {
            const listingHTML = `
                <div class="listing-card">
                    <div class="listing-header">
                        <div class="listing-resource">
                            <span>${getResourceIcon(listing.resourceType)}</span>
                            <span>${getResourceName(listing.resourceType)}</span>
                        </div>
                        <div class="listing-seller">Seller: ${listing.sellerName}</div>
                    </div>
                    <div class="listing-details">
                        <div class="listing-amount">
                            <div class="listing-label">Amount</div>
                            <div class="listing-value">${listing.amount} units</div>
                        </div>
                        <div class="listing-price">
                            <div class="listing-label">Price per unit</div>
                            <div class="listing-value">${listing.pricePerUnit} 💰</div>
                        </div>
                        <div class="listing-total">
                            <div class="listing-label">Total Cost</div>
                            <div class="listing-value">${listing.totalPrice} 💰</div>
                        </div>
                    </div>
                    <div class="listing-actions">
                        <button class="listing-btn buy" onclick="buyListing('${listing.listingId}')">
                            💰 Buy Now
                        </button>
                    </div>
                </div>
            `;
            container.innerHTML += listingHTML;
        });
    }

    // Buy listing
    window.buyListing = async function(listingId) {
        if (!confirm('Confirm purchase?')) return;

        const result = await purchaseFromMarketplace(listingId);

        if (result.success) {
            alert(`✅ Purchase successful!\n\n+${result.trade.amount} ${result.trade.resourceType}`);
            await loadMarketplace();
        } else {
            alert(`❌ Error: ${result.error}`);
        }
    };

    // Create listing
    window.createListing = async function(event) {
        event.preventDefault();

        const resource = document.getElementById('sell-resource').value;
        const amount = parseInt(document.getElementById('sell-amount').value);
        const price = parseInt(document.getElementById('sell-price').value);

        const result = await createMarketplaceListing(resource, amount, price);

        if (result.success) {
            alert('✅ Listing created successfully!');
            await loadMarketplace();
            document.getElementById('sell-form').reset();
        } else {
            alert(`❌ Error: ${result.error}`);
        }
    };

    // Initialize
    loadMarketplace();
</script>
```

---

### Step 4: Add to Navigation Menu

**File**: `dashboard.html`

Update navigation section:

```html
<div id="nav-buttons">
    <button id="walletBtn" class="nav-btn wallet-btn">👛 Wallet</button>

    <!-- NEW: Nexus Crater Links -->
    <a href="/Learning JS/nexus-claim-station.html" class="nav-btn" style="background: linear-gradient(135deg, #00CED1, #00FFFF); color: #000;">
        🎁 Daily Claims
    </a>
    <a href="/Learning JS/nexus-marketplace.html" class="nav-btn" style="background: linear-gradient(135deg, #00CED1, #00FFFF); color: #000;">
        💱 Marketplace
    </a>

    <!-- Existing links -->
    <a href="/Learning JS/roadmap.html" class="nav-btn">🗺️ Roadmap</a>
    <a href="/Learning JS/chatroom.html" class="nav-btn">💬 Chat</a>
    <a href="/Learning JS/notes.html" class="nav-btn">📝 Notes</a>
    <a href="/Learning JS/console.html" class="nav-btn">⚙️ Console</a>
    <a href="/index.html" class="nav-btn secondary">← Home</a>
</div>
```

---

### Step 5: Scheduled Tasks (Optional)

Set up a Cloud Function or server-side script to run daily at 00:00 UTC:

```javascript
// Reset daily resources
import { initializeDailyResources } from './nexus-firebase-integration.js';

// Run at 00:00 UTC daily
async function dailyReset() {
    await initializeDailyResources();
    console.log('Daily resources reset completed');
}
```

---

## 🔐 Security Considerations

1. **User Authentication**: All write operations require authenticated users
2. **Transaction Safety**: Resource claims use atomic transactions to prevent race conditions
3. **Validation**: All inputs are validated before database writes
4. **Rate Limiting**: Consider adding rate limiting for marketplace operations
5. **Anti-Cheat**: Resource amounts are validated against user's actual inventory

---

## 📊 Database Monitoring

### Check Daily Resource Status

```javascript
import { getDailyResourcesStatus } from './nexus-firebase-integration.js';

const status = await getDailyResourcesStatus();
console.log('Daily Resources:', status);
```

### Monitor Active Listings

```javascript
import { getMarketplaceListings } from './nexus-firebase-integration.js';

const listings = await getMarketplaceListings();
console.log('Active Listings:', listings.length);
```

### Check User Reputation

```javascript
import { getUserReputation } from './nexus-firebase-integration.js';

const rep = await getUserReputation('userId');
console.log('Reputation:', rep);
```

---

## 🎯 Testing Checklist

- [ ] Daily resources initialize correctly
- [ ] Resource claims deduct from global pool
- [ ] User can't claim same resource twice in a day
- [ ] Marketplace listings appear correctly
- [ ] Purchases deduct Lunaris and add resources
- [ ] Sellers receive payment (minus 5% fee)
- [ ] Reputation updates on trades
- [ ] Real-time updates work for all users
- [ ] Sold out resources show correct status
- [ ] Market prices fluctuate periodically

---

## 🚀 Next Steps

1. Test all claim station functionality
2. Test marketplace buy/sell operations
3. Verify database security rules
4. Monitor Firebase usage and costs
5. Add error handling and user notifications
6. Implement Resource Rush mini-game
7. Add leaderboards and statistics

---

## 📞 Support

If you encounter any issues:
1. Check browser console for errors
2. Verify Firebase configuration
3. Check database security rules
4. Ensure user is authenticated
5. Review Firebase usage limits

---

**Last Updated**: January 2025
**Version**: 1.0
**Status**: Ready for Integration
