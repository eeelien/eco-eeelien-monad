import { monadTestnet } from "viem/chains";

export const CHAIN = monadTestnet;

// ── Direcciones en Monad Testnet (Chain 10143) ──────────────────────────────
export const ECO_TOKEN_ADDRESS           = "0x03b5e6F27E1b1A1ae5aA990074209FcFaE473222" as const;
export const RECYCLING_REGISTRY_ADDRESS  = "0x18590Db5176e85785fb859b4b96E99b0A4D2f817" as const;
export const CHALLENGE_MANAGER_ADDRESS   = "0x1507eFa34a2f9E33ed491526132BfAf6A5C50c97" as const;
export const VOUCHER_NFT_ADDRESS         = "0x188496b92FB6580Dfd9159C40FD5Bf4Fb438d729" as const;

// ── EcoToken ABI ─────────────────────────────────────────────────────────────
export const ECO_TOKEN_ABI = [
  { name: "balanceOf",   type: "function", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { name: "symbol",      type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "string" }] },
  { name: "decimals",    type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint8" }] },
  { name: "approve",     type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }] },
  { name: "allowance",   type: "function", stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
    outputs: [{ name: "", type: "uint256" }] },
] as const;

// ── RecyclingRegistry ABI ────────────────────────────────────────────────────
export const REGISTRY_ABI = [
  { name: "registerBottle", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "user", type: "address" }, { name: "bottleType", type: "uint8" }],
    outputs: [] },
  { name: "getUserStats",   type: "function", stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "bottlesRecycled", type: "uint256" }, { name: "tokensEarned", type: "uint256" }] },
  { name: "globalTotalRecycled", type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { name: "operators",     type: "function", stateMutability: "view",
    inputs: [{ name: "", type: "address" }], outputs: [{ name: "", type: "bool" }] },
] as const;

// ── ChallengeManager ABI ─────────────────────────────────────────────────────
export const CHALLENGE_MANAGER_ABI = [
  { name: "claimChallenges", type: "function", stateMutability: "nonpayable",
    inputs: [], outputs: [] },
  { name: "trackAndClaim",   type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "user", type: "address" }, { name: "bottleType", type: "uint8" }],
    outputs: [] },
  { name: "getUserChallenges", type: "function", stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "allChallenges", type: "tuple[]", components: [
        { name: "name",        type: "string" },
        { name: "description", type: "string" },
        { name: "badge",       type: "string" },
        { name: "ctype",       type: "uint8"  },
        { name: "target",      type: "uint256" },
        { name: "bonusReward", type: "uint256" },
        { name: "active",      type: "bool"   },
      ]},
      { name: "completedStatus", type: "bool[]" },
      { name: "progress",        type: "uint256[]" },
    ]},
  { name: "challengeCount", type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint256" }] },
  {
    name: "ChallengeCompleted", type: "event",
    inputs: [
      { name: "user",        type: "address", indexed: true },
      { name: "challengeId", type: "uint256", indexed: true },
      { name: "badge",       type: "string",  indexed: false },
      { name: "bonusReward", type: "uint256", indexed: false },
    ],
  },
] as const;

// ── VoucherNFT ABI ───────────────────────────────────────────────────────────
export const VOUCHER_NFT_ABI = [
  { name: "redeemVoucher", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "typeId", type: "uint256" }], outputs: [{ name: "tokenId", type: "uint256" }] },
  { name: "voucherTypeCount", type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { name: "voucherTypes",   type: "function", stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "partnerName",    type: "string"  },
      { name: "description",    type: "string"  },
      { name: "imageURI",       type: "string"  },
      { name: "ecoCost",        type: "uint256" },
      { name: "active",         type: "bool"    },
      { name: "totalRedeemed",  type: "uint256" },
    ]},
  { name: "balanceOf",     type: "function", stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { name: "isValidVoucher", type: "function", stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      { name: "valid",       type: "bool"    },
      { name: "partnerName", type: "string"  },
      { name: "description", type: "string"  },
      { name: "owner_",      type: "address" },
      { name: "used",        type: "bool"    },
    ]},
] as const;

// ── Constantes ───────────────────────────────────────────────────────────────
export const BOTTLE_TYPES = {
  0: { label: "Plástico",  emoji: "🥤", reward: 5  },
  1: { label: "Aluminio",  emoji: "🥫", reward: 10 },
} as const;

export const PARTNER_EMOJIS: Record<string, string> = {
  "Starbucks CDMX": "☕",
  "Spotify Premium": "🎵",
  "Eco Tienda": "🌿",
};
