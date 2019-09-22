export default {
  'private-key': {
    alias: 'k',
    type: 'string',
    description: 'Use private key for transactions',
  },
  url: {
    alias: 'u',
    type: 'string',
    description: 'Use custom url to access Zilliqa api',
  },
  'chain-id': {
    type: 'number',
    description: 'Use custom Zilliqa chain id',
    default: 1,
  },
} as const
