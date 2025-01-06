import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
let listingCount = 0;
const serviceListings = new Map();
const tokenBalances = new Map();

// Simulated contract functions
function createServiceListing(algorithmId: number, computeAmount: number, price: number, expiration: number, provider: string) {
  const listingId = ++listingCount;
  serviceListings.set(listingId, {
    provider,
    algorithmId,
    computeAmount,
    price,
    expiration: Date.now() + expiration * 1000 // Convert to milliseconds
  });
  return listingId;
}

function purchaseService(listingId: number, buyer: string) {
  const listing = serviceListings.get(listingId);
  if (!listing) throw new Error('Invalid listing');
  if (Date.now() > listing.expiration) throw new Error('Listing expired');
  const buyerBalance = tokenBalances.get(buyer) || 0;
  if (buyerBalance < listing.price) throw new Error('Insufficient balance');
  
  // Transfer tokens
  tokenBalances.set(buyer, buyerBalance - listing.price);
  const providerBalance = tokenBalances.get(listing.provider) || 0;
  tokenBalances.set(listing.provider, providerBalance + listing.price);
  
  // Mint compute tokens
  const buyerComputeBalance = tokenBalances.get(`compute_${buyer}`) || 0;
  tokenBalances.set(`compute_${buyer}`, buyerComputeBalance + listing.computeAmount);
  
  // Remove listing
  serviceListings.delete(listingId);
  return true;
}

function cancelServiceListing(listingId: number, canceler: string) {
  const listing = serviceListings.get(listingId);
  if (!listing) throw new Error('Invalid listing');
  if (listing.provider !== canceler) throw new Error('Not authorized');
  serviceListings.delete(listingId);
  return true;
}

// Helper function to set token balance
function setTokenBalance(account: string, balance: number) {
  tokenBalances.set(account, balance);
}

describe('Optimization Services Marketplace Contract', () => {
  beforeEach(() => {
    listingCount = 0;
    serviceListings.clear();
    tokenBalances.clear();
  });
  
  it('should create a new service listing', () => {
    const id = createServiceListing(1, 1000, 500, 3600, 'provider1');
    expect(id).toBe(1);
    const listing = serviceListings.get(id);
    expect(listing.computeAmount).toBe(1000);
    expect(listing.price).toBe(500);
  });
  
  it('should allow purchasing of services', () => {
    setTokenBalance('buyer1', 1000);
    const listingId = createServiceListing(2, 2000, 800, 7200, 'provider2');
    expect(purchaseService(listingId, 'buyer1')).toBe(true);
    expect(tokenBalances.get('buyer1')).toBe(200);
    expect(tokenBalances.get('provider2')).toBe(800);
    expect(tokenBalances.get('compute_buyer1')).toBe(2000);
    expect(serviceListings.has(listingId)).toBe(false);
  });
  
  it('should not allow purchase with insufficient balance', () => {
    setTokenBalance('buyer2', 300);
    const listingId = createServiceListing(3, 1500, 1000, 5400, 'provider3');
    expect(() => purchaseService(listingId, 'buyer2')).toThrow('Insufficient balance');
  });
  
  it('should allow cancellation of listing by provider', () => {
    const listingId = createServiceListing(4, 3000, 1500, 10800, 'provider4');
    expect(cancelServiceListing(listingId, 'provider4')).toBe(true);
    expect(serviceListings.has(listingId)).toBe(false);
  });
  
  it('should not allow cancellation by non-provider', () => {
    const listingId = createServiceListing(5, 500, 250, 3600, 'provider5');
    expect(() => cancelServiceListing(listingId, 'unauthorized_user')).toThrow('Not authorized');
  });
  
  it('should not allow purchase of expired listing', async () => {
    setTokenBalance('buyer3', 2000);
    const listingId = createServiceListing(6, 1000, 500, 1, 'provider6');
    
    // Wait for the listing to expire
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    expect(() => purchaseService(listingId, 'buyer3')).toThrow('Listing expired');
  });
});

