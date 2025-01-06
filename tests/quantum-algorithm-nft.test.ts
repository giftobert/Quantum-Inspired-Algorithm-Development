import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
let lastTokenId = 0;
const tokenMetadata = new Map();
const tokenOwners = new Map();

// Simulated contract functions
function mintAlgorithmNFT(algorithmId: number, name: string, description: string, innovationScore: number, creator: string) {
  const tokenId = ++lastTokenId;
  if (innovationScore < 0 || innovationScore > 100) {
    throw new Error('Invalid innovation score');
  }
  tokenMetadata.set(tokenId, {
    creator,
    algorithmId,
    name,
    description,
    innovationScore,
    creationTime: Date.now()
  });
  tokenOwners.set(tokenId, creator);
  return tokenId;
}

function transferAlgorithmNFT(tokenId: number, sender: string, recipient: string) {
  if (tokenOwners.get(tokenId) !== sender) {
    throw new Error('Not authorized');
  }
  tokenOwners.set(tokenId, recipient);
  return true;
}

describe('Quantum-Inspired Algorithm NFT Contract', () => {
  beforeEach(() => {
    lastTokenId = 0;
    tokenMetadata.clear();
    tokenOwners.clear();
  });
  
  it('should mint a new quantum-inspired algorithm NFT', () => {
    const id = mintAlgorithmNFT(1, 'Quantum Annealing NFT', 'A tokenized quantum annealing algorithm', 85, 'developer1');
    expect(id).toBe(1);
    const metadata = tokenMetadata.get(id);
    expect(metadata.name).toBe('Quantum Annealing NFT');
    expect(metadata.innovationScore).toBe(85);
    expect(tokenOwners.get(id)).toBe('developer1');
  });
  
  it('should transfer algorithm NFT ownership', () => {
    const id = mintAlgorithmNFT(2, 'QAOA NFT', 'Quantum Approximate Optimization Algorithm token', 90, 'developer2');
    expect(transferAlgorithmNFT(id, 'developer2', 'collector1')).toBe(true);
    expect(tokenOwners.get(id)).toBe('collector1');
  });
  
  it('should not allow minting with invalid innovation score', () => {
    expect(() => mintAlgorithmNFT(3, 'Invalid NFT', 'This should fail', 101, 'developer3')).toThrow('Invalid innovation score');
  });
  
  it('should not allow unauthorized transfers', () => {
    const id = mintAlgorithmNFT(4, 'VQE NFT', 'Variational Quantum Eigensolver token', 88, 'developer4');
    expect(() => transferAlgorithmNFT(id, 'unauthorized_user', 'collector2')).toThrow('Not authorized');
  });
});

