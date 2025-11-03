// Mock inventory database
// In a real application, this would be a database
const inventory = new Map();

// Pricing tiers based on inventory count
const PRICING_TIERS = {
  HIGH_DEMAND: { maxCount: 5, price: 5.00 },    // We have 0-5 copies (high demand, pay more)
  MEDIUM_DEMAND: { maxCount: 15, price: 5.00 }, // We have 6-15 copies (medium demand)
  LOW_DEMAND: { maxCount: 30, price: 3.00 },    // We have 16-30 copies (lower demand)
  OVERSUPPLIED: { maxCount: Infinity, price: 1.00 } // We have 30+ copies (oversupplied)
};

// Calculate purchase price based on current inventory
export function calculatePurchasePrice(upc) {
  const currentCount = inventory.get(upc) || 0;

  for (const [tier, { maxCount, price }] of Object.entries(PRICING_TIERS)) {
    if (currentCount <= maxCount) {
      return {
        price,
        currentCount,
        tier,
        reason: getPriceReason(tier, currentCount)
      };
    }
  }

  return {
    price: 0.50,
    currentCount,
    tier: 'NOT_ACCEPTING',
    reason: 'We are not currently accepting this item'
  };
}

function getPriceReason(tier, count) {
  const reasons = {
    HIGH_DEMAND: `High demand item (${count} in stock)`,
    MEDIUM_DEMAND: `Good seller (${count} in stock)`,
    LOW_DEMAND: `Limited demand (${count} in stock)`,
    OVERSUPPLIED: `Overstocked (${count} in stock)`
  };
  return reasons[tier] || '';
}

// Get current inventory count
export function getInventoryCount(upc) {
  return inventory.get(upc) || 0;
}

// Add item to inventory
export function addToInventory(upc) {
  const current = inventory.get(upc) || 0;
  inventory.set(upc, current + 1);
  return current + 1;
}

// Set inventory count (for testing/admin purposes)
export function setInventoryCount(upc, count) {
  inventory.set(upc, count);
  return count;
}

// Get all inventory items
export function getAllInventory() {
  return Array.from(inventory.entries()).map(([upc, count]) => ({
    upc,
    count,
    pricing: calculatePurchasePrice(upc)
  }));
}

// Initialize with some mock data for testing
export function initializeMockData() {
  // Example UPCs with different inventory levels
  inventory.set('123456789012', 2);   // High demand
  inventory.set('987654321098', 10);  // Medium demand
  inventory.set('456789012345', 20);  // Low demand
  inventory.set('789012345678', 35);  // Oversupplied
}
