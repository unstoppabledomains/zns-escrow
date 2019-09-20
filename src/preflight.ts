import {
  getAddressFromPrivateKey,
  normaliseAddress,
  toBech32Address,
} from '@zilliqa-js/crypto';
import namehash from 'namicorn/lib/zns/namehash';
import error from './error';

function preflight<T extends {} = {}>({
  domain,
  url,
  chainId,
  registry,
  privateKey,
  verbose = false,
  ...rest
}): {
  domain: string;
  node: string;
  url: string;
  chainId: number;
  registry: string;
  privateKey: string;
  verbose: boolean;
} & T {
  if (!/^[a-f\d]{64}|[A-F\d]{64}$/.test(privateKey)) {
    error('bad private key', true);
  }

  let node;
  try {
    node = namehash(domain);
  } catch (err) {
    error('bad domain', true);
  }

  let registryAddress;
  if (registry) {
    try {
      registryAddress = normaliseAddress(registryAddress);
    } catch (err) {
      error('bad registry', true);
    }
  }

  switch (chainId) {
    // mainnet
    case 1: {
      return {
        verbose,
        domain,
        node,
        url: url || 'https://api.zilliqa.com/',
        chainId,
        registry:
          registryAddress ||
          normaliseAddress(
            toBech32Address('0x9611c53be6d1b32058b2747bdececed7e1216793'),
          ),
        privateKey,
        ...rest,
      } as any;
    }
    // testnet
    case 333: {
      // if (!registry) {
      //   error('must supply registry using testnet', true);
      // }

      return {
        verbose,
        domain,
        node,
        url: url || 'https://dev-api.zilliqa.com/',
        chainId,
        registry,
        privateKey,
        ...rest,
      } as any;
    }
    // kaya
    case 111: {
      error('cannot use kaya', true);
    }
    default: {
      if (!registry) {
        error('must supply registry using private chain', true);
      }

      if (!url) {
        error('must supply url using private chain', true);
      }

      return {
        verbose,
        domain,
        node,
        url,
        chainId,
        registry,
        privateKey,
        ...rest,
      } as any;
    }
  }
}

function deployPreflight(argv) {
  const {
    privateKey,
    domain,
    verbose,
    url,
    chainId,
    registry,
    node,
    buyer,
    price,
    qa = false,
    seller = getAddressFromPrivateKey(privateKey),
  } = preflight<{buyer: string; price: number; qa?: boolean; seller?: string}>(
    argv,
  );

  let buyerAddress!: string;
  try {
    buyerAddress = normaliseAddress(buyer);
  } catch (err) {
    error('bad buyer', true);
  }

  let sellerAddress!: string;
  try {
    sellerAddress = normaliseAddress(seller);
  } catch (err) {
    error('bad seller', true);
  }

  if (!Number.isInteger(price) || price < 1) {
    error('bad price, must be positive integer', true);
  }

  return {
    privateKey,
    domain,
    verbose,
    url,
    chainId,
    registry,
    node,
    buyer: buyerAddress,
    price: qa ? price : price * 10 ** 12,
    seller: sellerAddress,
  };
}

function depositPreflight(argv) {
  const {
    privateKey,
    domain,
    verbose,
    url,
    chainId,
    registry,
    escrow,
    node,
  } = preflight<{escrow: string}>(argv);

  let escrowAddress!: string;
  try {
    escrowAddress = normaliseAddress(escrow);
  } catch (err) {
    error('bad escrow', true);
  }

  return {
    escrow: escrowAddress,
    privateKey,
    domain,
    verbose,
    url,
    chainId,
    registry,
    node,
  };
}

export {
  deployPreflight,
  deployPreflight as sellPreflight,
  depositPreflight,
  depositPreflight as buyPreflight,
};
