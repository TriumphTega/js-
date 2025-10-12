/**
 * ═══════════════════════════════════════════════════════════════
 * NEXUS CRATER - FIREBASE DATABASE INTEGRATION
 * ═══════════════════════════════════════════════════════════════
 *
 * This module handles all Firebase operations for the Nexus Crater phase:
 * - Global daily resource claims (app-wide limits)
 * - Marketplace listings and trades
 * - Reputation system
 * - Real-time updates and synchronization
 *
 * Author: Lunaris Development Team
 * Version: 1.0
 * ═══════════════════════════════════════════════════════════════
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    getDatabase,
    ref,
    set,
    get,
    update,
    push,
    onValue,
    increment,
    serverTimestamp,
    runTransaction
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// ═══════════════════════════════════════════════════════════════
// FIREBASE CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const firebaseConfig = {
    apiKey: "AIzaSyClPgII54QDvJB3kiV1dWbqm1et_lHasvs",
    authDomain: "lunaris-45d84.firebaseapp.com",
    projectId: "lunaris-45d84",
    storageBucket: "lunaris-45d84.firebasestorage.app",
    messagingSenderId: "74359858445",
    appId: "1:74359858445:web:37772cebcbb0d71d707c44",
    measurementId: "G-ETRK2NL1N2",
    databaseURL: "https://lunaris-45d84-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// ═══════════════════════════════════════════════════════════════
// DATABASE SCHEMA REFERENCE
// ═══════════════════════════════════════════════════════════════

/**
 * DATABASE STRUCTURE:
 *
 * nexus-daily-resources/{date}/
 *   ├── premiumOxygen: { total: 1000, claimed: 742, lastUpdate: timestamp }
 *   ├── hyperHydroponics: { total: 500, claimed: 489, lastUpdate: timestamp }
 *   ├── energyCrystal: { total: 250, claimed: 250, lastUpdate: timestamp }
 *   └── lunarisBonus: { total: 2000, claimed: 145, lastUpdate: timestamp }
 *
 * nexus-user-claims/{userId}/{date}/
 *   ├── premiumOxygen: { claimed: true, timestamp: 1736934000, amount: 50 }
 *   ├── hyperHydroponics: { claimed: false }
 *   ├── energyCrystal: { claimed: false }
 *   └── lunarisBonus: { claimed: true, timestamp: 1736935200, amount: 100 }
 *
 * nexus-marketplace-listings/{listingId}/
 *   ├── sellerId: "user123"
 *   ├── resourceType: "oxygen"
 *   ├── amount: 100
 *   ├── pricePerUnit: 10
 *   ├── totalPrice: 1000
 *   ├── createdAt: timestamp
 *   ├── status: "active" | "sold" | "cancelled"
 *   └── expiresAt: timestamp
 *
 * nexus-trade-history/{tradeId}/
 *   ├── buyerId: "user456"
 *   ├── sellerId: "user123"
 *   ├── resourceType: "oxygen"
 *   ├── amount: 100
 *   ├── price: 1000
 *   ├── timestamp: timestamp
 *   └── type: "marketplace" | "direct"
 *
 * nexus-reputation/{userId}/
 *   ├── totalRep: 1250
 *   ├── level: 4
 *   ├── tradesCompleted: 47
 *   ├── claimStreak: 12
 *   ├── lastActiveDate: "2025-01-15"
 *   ├── badges: ["early-bird", "trader", "helper"]
 *   └── recentActivity: [...]
 *
 * nexus-market-prices/
 *   ├── oxygen: { price: 10, change: 5, lastUpdate: timestamp }
 *   ├── hydroponics: { price: 15, change: -2, lastUpdate: timestamp }
 *   └── energy: { price: 20, change: 0, lastUpdate: timestamp }
 */

// ═══════════════════════════════════════════════════════════════
// RESOURCE CLAIM CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const DAILY_RESOURCES = {
    premiumOxygen: {
        name: 'Premium Oxygen',
        icon: '💨',
        dailyLimit: 1000,
        claimAmount: 50,
        rarity: 'rare',
        resourceKey: 'oxygen'
    },
    hyperHydroponics: {
        name: 'Hyper-Hydroponics',
        icon: '🌱',
        dailyLimit: 500,
        claimAmount: 75,
        rarity: 'epic',
        resourceKey: 'hydroponics'
    },
    energyCrystal: {
        name: 'Energy Crystal',
        icon: '⚡',
        dailyLimit: 250,
        claimAmount: 100,
        rarity: 'legendary',
        resourceKey: 'energy'
    },
    lunarisBonus: {
        name: 'Lunaris Bonus',
        icon: '💰',
        dailyLimit: 2000,
        claimAmount: 100,
        rarity: 'uncommon',
        resourceKey: 'lunaris'
    }
};

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get today's date string in YYYY-MM-DD format
 */
function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Get current user ID
 */
function getCurrentUserId() {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('User not authenticated');
    }
    return user.uid;
}

// ═══════════════════════════════════════════════════════════════
// DAILY RESOURCE CLAIM SYSTEM
// ═══════════════════════════════════════════════════════════════

/**
 * Initialize daily resources for today (if not exists)
 */
export async function initializeDailyResources() {
    const today = getTodayString();
    const resourcesRef = ref(database, `nexus-daily-resources/${today}`);

    try {
        const snapshot = await get(resourcesRef);

        if (!snapshot.exists()) {
            // Create today's resource pool
            const initialData = {};
            Object.keys(DAILY_RESOURCES).forEach(key => {
                initialData[key] = {
                    total: DAILY_RESOURCES[key].dailyLimit,
                    claimed: 0,
                    lastUpdate: serverTimestamp()
                };
            });

            await set(resourcesRef, initialData);
            console.log('✅ Daily resources initialized for', today);
        }

        return true;
    } catch (error) {
        console.error('❌ Error initializing daily resources:', error);
        return false;
    }
}

/**
 * Get current state of all daily resources
 */
export async function getDailyResourcesStatus() {
    const today = getTodayString();
    const resourcesRef = ref(database, `nexus-daily-resources/${today}`);

    try {
        const snapshot = await get(resourcesRef);

        if (!snapshot.exists()) {
            await initializeDailyResources();
            return await getDailyResourcesStatus();
        }

        const data = snapshot.val();
        const status = {};

        Object.keys(DAILY_RESOURCES).forEach(key => {
            const config = DAILY_RESOURCES[key];
            const current = data[key] || { total: config.dailyLimit, claimed: 0 };

            status[key] = {
                ...config,
                totalAvailable: current.total,
                claimed: current.claimed,
                remaining: current.total - current.claimed,
                percentage: ((current.total - current.claimed) / current.total * 100).toFixed(1),
                soldOut: current.claimed >= current.total
            };
        });

        return status;
    } catch (error) {
        console.error('❌ Error getting resource status:', error);
        return null;
    }
}

/**
 * Listen to real-time updates on daily resources
 */
export function listenToDailyResources(callback) {
    const today = getTodayString();
    const resourcesRef = ref(database, `nexus-daily-resources/${today}`);

    return onValue(resourcesRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            callback(data);
        }
    });
}

/**
 * Check if user has already claimed a specific resource today
 */
export async function hasUserClaimed(resourceType) {
    try {
        const userId = getCurrentUserId();
        const today = getTodayString();
        const claimRef = ref(database, `nexus-user-claims/${userId}/${today}/${resourceType}`);

        const snapshot = await get(claimRef);
        return snapshot.exists() && snapshot.val().claimed === true;
    } catch (error) {
        console.error('❌ Error checking user claim:', error);
        return false;
    }
}

/**
 * Claim a daily resource (atomic transaction)
 */
export async function claimDailyResource(resourceType) {
    try {
        const userId = getCurrentUserId();
        const today = getTodayString();

        // Check if resource type is valid
        if (!DAILY_RESOURCES[resourceType]) {
            throw new Error('Invalid resource type');
        }

        const config = DAILY_RESOURCES[resourceType];

        // Check if user already claimed
        const alreadyClaimed = await hasUserClaimed(resourceType);
        if (alreadyClaimed) {
            return {
                success: false,
                error: 'already_claimed',
                message: 'You have already claimed this resource today'
            };
        }

        // Atomic transaction to claim resource
        const resourceRef = ref(database, `nexus-daily-resources/${today}/${resourceType}`);

        const result = await runTransaction(resourceRef, (current) => {
            if (current === null) {
                // Initialize if doesn't exist
                return {
                    total: config.dailyLimit,
                    claimed: 1,
                    lastUpdate: Date.now()
                };
            }

            // Check if sold out
            if (current.claimed >= current.total) {
                return; // Abort transaction
            }

            // Increment claimed count
            return {
                ...current,
                claimed: current.claimed + 1,
                lastUpdate: Date.now()
            };
        });

        if (!result.committed) {
            return {
                success: false,
                error: 'sold_out',
                message: 'This resource is sold out. Try again tomorrow!'
            };
        }

        // Record user's claim
        const claimRef = ref(database, `nexus-user-claims/${userId}/${today}/${resourceType}`);
        await set(claimRef, {
            claimed: true,
            timestamp: serverTimestamp(),
            amount: config.claimAmount
        });

        // Update user's resources
        const userResourceRef = ref(database, `colony-data/${userId}/${config.resourceKey}`);
        await update(userResourceRef, {
            [config.resourceKey]: increment(config.claimAmount)
        });

        // Update claim streak
        await updateClaimStreak(userId);

        // Update reputation
        await addReputation(userId, 2, `claimed ${config.name}`);

        return {
            success: true,
            amount: config.claimAmount,
            resourceType: config.resourceKey,
            remaining: result.snapshot.val().total - result.snapshot.val().claimed
        };

    } catch (error) {
        console.error('❌ Error claiming resource:', error);
        return {
            success: false,
            error: 'system_error',
            message: error.message
        };
    }
}

/**
 * Get user's claim history for the current month
 */
export async function getUserClaimHistory(userId = null) {
    try {
        const uid = userId || getCurrentUserId();
        const claimsRef = ref(database, `nexus-user-claims/${uid}`);

        const snapshot = await get(claimsRef);

        if (!snapshot.exists()) {
            return { totalDays: 0, claims: {} };
        }

        const data = snapshot.val();
        const claims = {};
        let totalDays = 0;

        Object.keys(data).forEach(date => {
            const dayClaims = data[date];
            let dayTotal = 0;

            Object.keys(dayClaims).forEach(resource => {
                if (dayClaims[resource].claimed) {
                    dayTotal++;
                }
            });

            if (dayTotal > 0) {
                totalDays++;
                claims[date] = dayClaims;
            }
        });

        return { totalDays, claims };
    } catch (error) {
        console.error('❌ Error getting claim history:', error);
        return { totalDays: 0, claims: {} };
    }
}

/**
 * Update user's claim streak
 */
async function updateClaimStreak(userId) {
    try {
        const today = getTodayString();
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        const repRef = ref(database, `nexus-reputation/${userId}`);
        const snapshot = await get(repRef);

        let streak = 1;

        if (snapshot.exists()) {
            const data = snapshot.val();
            const lastClaim = data.lastClaimDate;

            if (lastClaim === yesterday) {
                // Continue streak
                streak = (data.claimStreak || 0) + 1;
            } else if (lastClaim === today) {
                // Already claimed today
                streak = data.claimStreak || 1;
            } else {
                // Streak broken
                streak = 1;
            }
        }

        await update(repRef, {
            claimStreak: streak,
            lastClaimDate: today
        });

        return streak;
    } catch (error) {
        console.error('❌ Error updating streak:', error);
        return 1;
    }
}

// ═══════════════════════════════════════════════════════════════
// MARKETPLACE TRADING SYSTEM
// ═══════════════════════════════════════════════════════════════

/**
 * Create a new marketplace listing
 */
export async function createMarketplaceListing(resourceType, amount, pricePerUnit) {
    try {
        const userId = getCurrentUserId();

        // Validate inputs
        if (!resourceType || amount < 10 || pricePerUnit < 1) {
            throw new Error('Invalid listing parameters');
        }

        // Check user has enough resources
        const userDataRef = ref(database, `colony-data/${userId}`);
        const snapshot = await get(userDataRef);

        if (!snapshot.exists()) {
            throw new Error('User data not found');
        }

        const userData = snapshot.val();
        if (!userData[resourceType] || userData[resourceType] < amount) {
            throw new Error('Insufficient resources');
        }

        // Create listing
        const listingsRef = ref(database, 'nexus-marketplace-listings');
        const newListingRef = push(listingsRef);

        const listing = {
            listingId: newListingRef.key,
            sellerId: userId,
            sellerName: userData.displayName || 'Anonymous',
            resourceType,
            amount,
            pricePerUnit,
            totalPrice: amount * pricePerUnit,
            createdAt: serverTimestamp(),
            status: 'active',
            expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
        };

        await set(newListingRef, listing);

        // Deduct resources from seller (lock them in listing)
        await update(ref(database, `colony-data/${userId}`), {
            [resourceType]: increment(-amount)
        });

        return {
            success: true,
            listingId: newListingRef.key,
            listing
        };

    } catch (error) {
        console.error('❌ Error creating listing:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get all active marketplace listings
 */
export async function getMarketplaceListings(resourceType = null) {
    try {
        const listingsRef = ref(database, 'nexus-marketplace-listings');
        const snapshot = await get(listingsRef);

        if (!snapshot.exists()) {
            return [];
        }

        const data = snapshot.val();
        const listings = [];

        Object.keys(data).forEach(key => {
            const listing = data[key];

            // Filter active and non-expired listings
            if (listing.status === 'active' && listing.expiresAt > Date.now()) {
                if (!resourceType || listing.resourceType === resourceType) {
                    listings.push({
                        ...listing,
                        listingId: key
                    });
                }
            }
        });

        // Sort by creation date (newest first)
        listings.sort((a, b) => b.createdAt - a.createdAt);

        return listings;
    } catch (error) {
        console.error('❌ Error getting listings:', error);
        return [];
    }
}

/**
 * Purchase a resource from marketplace
 */
export async function purchaseFromMarketplace(listingId) {
    try {
        const buyerId = getCurrentUserId();
        const listingRef = ref(database, `nexus-marketplace-listings/${listingId}`);

        // Get listing details
        const listingSnapshot = await get(listingRef);
        if (!listingSnapshot.exists()) {
            throw new Error('Listing not found');
        }

        const listing = listingSnapshot.val();

        // Validate listing is still active
        if (listing.status !== 'active') {
            throw new Error('Listing is no longer active');
        }

        if (listing.sellerId === buyerId) {
            throw new Error('Cannot buy your own listing');
        }

        // Check buyer has enough Lunaris
        const buyerDataRef = ref(database, `colony-data/${buyerId}`);
        const buyerSnapshot = await get(buyerDataRef);

        if (!buyerSnapshot.exists()) {
            throw new Error('Buyer data not found');
        }

        const buyerData = buyerSnapshot.val();
        if (!buyerData.lunaris || buyerData.lunaris < listing.totalPrice) {
            throw new Error('Insufficient Lunaris tokens');
        }

        // Process transaction
        const updates = {};

        // Update listing status
        updates[`nexus-marketplace-listings/${listingId}/status`] = 'sold';
        updates[`nexus-marketplace-listings/${listingId}/buyerId`] = buyerId;
        updates[`nexus-marketplace-listings/${listingId}/soldAt`] = serverTimestamp();

        // Deduct Lunaris from buyer
        updates[`colony-data/${buyerId}/lunaris`] = increment(-listing.totalPrice);

        // Add resource to buyer
        updates[`colony-data/${buyerId}/${listing.resourceType}`] = increment(listing.amount);

        // Calculate seller's earnings (95% after 5% marketplace fee)
        const fee = Math.floor(listing.totalPrice * 0.05);
        const sellerEarnings = listing.totalPrice - fee;

        // Add Lunaris to seller
        updates[`colony-data/${listing.sellerId}/lunaris`] = increment(sellerEarnings);

        // Perform all updates
        await update(ref(database), updates);

        // Record trade history
        const tradeRef = push(ref(database, 'nexus-trade-history'));
        await set(tradeRef, {
            tradeId: tradeRef.key,
            buyerId,
            sellerId: listing.sellerId,
            resourceType: listing.resourceType,
            amount: listing.amount,
            price: listing.totalPrice,
            fee,
            sellerEarnings,
            timestamp: serverTimestamp(),
            type: 'marketplace'
        });

        // Update reputation for both parties
        await addReputation(buyerId, 5, 'completed purchase');
        await addReputation(listing.sellerId, 5, 'completed sale');

        return {
            success: true,
            trade: {
                resourceType: listing.resourceType,
                amount: listing.amount,
                price: listing.totalPrice
            }
        };

    } catch (error) {
        console.error('❌ Error purchasing from marketplace:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Cancel a marketplace listing
 */
export async function cancelMarketplaceListing(listingId) {
    try {
        const userId = getCurrentUserId();
        const listingRef = ref(database, `nexus-marketplace-listings/${listingId}`);

        const snapshot = await get(listingRef);
        if (!snapshot.exists()) {
            throw new Error('Listing not found');
        }

        const listing = snapshot.val();

        // Verify ownership
        if (listing.sellerId !== userId) {
            throw new Error('Not authorized to cancel this listing');
        }

        // Update listing status
        await update(listingRef, {
            status: 'cancelled',
            cancelledAt: serverTimestamp()
        });

        // Return resources to seller
        await update(ref(database, `colony-data/${userId}`), {
            [listing.resourceType]: increment(listing.amount)
        });

        return {
            success: true,
            message: 'Listing cancelled successfully'
        };

    } catch (error) {
        console.error('❌ Error cancelling listing:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get user's active listings
 */
export async function getUserListings(userId = null) {
    try {
        const uid = userId || getCurrentUserId();
        const listingsRef = ref(database, 'nexus-marketplace-listings');

        const snapshot = await get(listingsRef);
        if (!snapshot.exists()) {
            return [];
        }

        const data = snapshot.val();
        const userListings = [];

        Object.keys(data).forEach(key => {
            const listing = data[key];
            if (listing.sellerId === uid && listing.status === 'active') {
                userListings.push({
                    ...listing,
                    listingId: key
                });
            }
        });

        return userListings;
    } catch (error) {
        console.error('❌ Error getting user listings:', error);
        return [];
    }
}

// ═══════════════════════════════════════════════════════════════
// REPUTATION SYSTEM
// ═══════════════════════════════════════════════════════════════

/**
 * Add reputation points to a user
 */
export async function addReputation(userId, amount, reason = '') {
    try {
        const repRef = ref(database, `nexus-reputation/${userId}`);
        const snapshot = await get(repRef);

        let currentRep = 0;
        let tradesCompleted = 0;

        if (snapshot.exists()) {
            const data = snapshot.val();
            currentRep = data.totalRep || 0;
            tradesCompleted = data.tradesCompleted || 0;
        }

        const newRep = currentRep + amount;
        const level = calculateReputationLevel(newRep);

        const updates = {
            totalRep: newRep,
            level,
            lastActiveDate: getTodayString()
        };

        if (reason.includes('trade') || reason.includes('purchase') || reason.includes('sale')) {
            updates.tradesCompleted = tradesCompleted + 1;
        }

        await update(repRef, updates);

        return {
            success: true,
            newRep,
            level,
            gained: amount
        };

    } catch (error) {
        console.error('❌ Error adding reputation:', error);
        return { success: false };
    }
}

/**
 * Calculate reputation level
 */
function calculateReputationLevel(rep) {
    if (rep >= 5000) return 6; // Legend
    if (rep >= 2500) return 5; // Tycoon
    if (rep >= 1000) return 4; // Merchant
    if (rep >= 500) return 3; // Trader
    if (rep >= 100) return 2; // Colonist
    return 1; // Newcomer
}

/**
 * Get user's reputation data
 */
export async function getUserReputation(userId = null) {
    try {
        const uid = userId || getCurrentUserId();
        const repRef = ref(database, `nexus-reputation/${uid}`);

        const snapshot = await get(repRef);

        if (!snapshot.exists()) {
            return {
                totalRep: 0,
                level: 1,
                levelName: 'Newcomer',
                tradesCompleted: 0,
                claimStreak: 0
            };
        }

        const data = snapshot.val();
        const levelNames = {
            1: 'Newcomer',
            2: 'Colonist',
            3: 'Trader',
            4: 'Merchant',
            5: 'Tycoon',
            6: 'Legend'
        };

        return {
            ...data,
            levelName: levelNames[data.level] || 'Newcomer'
        };

    } catch (error) {
        console.error('❌ Error getting reputation:', error);
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════
// MARKET PRICE SYSTEM
// ═══════════════════════════════════════════════════════════════

/**
 * Update market prices (should be called periodically)
 */
export async function updateMarketPrices() {
    try {
        const pricesRef = ref(database, 'nexus-market-prices');
        const snapshot = await get(pricesRef);

        const prices = {};
        const resources = ['oxygen', 'hydroponics', 'energy'];

        resources.forEach(resource => {
            let currentPrice = 10;
            let currentChange = 0;

            if (snapshot.exists() && snapshot.val()[resource]) {
                currentPrice = snapshot.val()[resource].price;
            }

            // Calculate new price with random fluctuation (-2 to +2)
            const change = Math.floor(Math.random() * 5) - 2;
            const newPrice = Math.max(5, Math.min(50, currentPrice + change));

            prices[resource] = {
                price: newPrice,
                change: ((newPrice - currentPrice) / currentPrice * 100).toFixed(1),
                lastUpdate: serverTimestamp()
            };
        });

        await update(pricesRef, prices);
        return prices;

    } catch (error) {
        console.error('❌ Error updating market prices:', error);
        return null;
    }
}

/**
 * Get current market prices
 */
export async function getMarketPrices() {
    try {
        const pricesRef = ref(database, 'nexus-market-prices');
        const snapshot = await get(pricesRef);

        if (!snapshot.exists()) {
            // Initialize default prices
            await updateMarketPrices();
            return await getMarketPrices();
        }

        return snapshot.val();
    } catch (error) {
        console.error('❌ Error getting market prices:', error);
        return null;
    }
}

/**
 * Listen to real-time market price updates
 */
export function listenToMarketPrices(callback) {
    const pricesRef = ref(database, 'nexus-market-prices');
    return onValue(pricesRef, (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.val());
        }
    });
}

// ═══════════════════════════════════════════════════════════════
// EXPORT ALL FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export {
    auth,
    database,
    getCurrentUserId,
    getTodayString
};

console.log('✅ Nexus Firebase Integration Module Loaded');
