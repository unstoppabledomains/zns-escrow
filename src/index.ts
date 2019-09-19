import {
  getAddressFromPrivateKey,
  normaliseAddress,
  toBech32Address,
} from '@zilliqa-js/crypto';
import chalk from 'chalk';
import namehash from 'namicorn/lib/zns/namehash';
import * as yargs from 'yargs';

function error(message, code = 1) {
  console.error('zns-escrow:', message);
  process.exit(code);
}

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
    error('bad private key');
  }

  let node;
  try {
    node = namehash(domain);
  } catch (error) {
    error('bad domain');
  }

  let registryAddress;
  if (registry) {
    try {
      registryAddress = normaliseAddress(registryAddress);
    } catch (error) {
      error('bad registry');
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
    case 111: {
      if (!registry) {
        error('must supply registry using testnet');
      }

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
    case 333: {
      error('cannot use kaya');
    }
    default: {
      if (!registry) {
        error('must supply registry using private chain');
      }

      if (!url) {
        error('must supply url using private chain');
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

  let buyerAddress: string;
  try {
    buyerAddress = normaliseAddress(buyer);
  } catch (error) {
    error('bad buyer');
  }

  let sellerAddress: string;
  try {
    sellerAddress = normaliseAddress(seller);
  } catch (error) {
    error('bad seller');
  }

  if (!Number.isInteger(price) || price < 1) {
    error('bad price, must be positive integer');
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
  } = preflight<{escrow: string}>(argv);

  let escrowAddress: string;
  try {
    escrowAddress = normaliseAddress(escrow);
  } catch (error) {
    error('bad escrow');
  }

  return {
    escrow: escrowAddress,
    privateKey,
    domain,
    verbose,
    url,
    chainId,
    registry,
  };
}

function handleSell(argv) {
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
    seller,
  } = deployPreflight(argv);

  console.log('sell', {
    privateKey,
    domain,
    verbose,
    url,
    chainId,
    registry,
    node,
    buyer,
    price,
    seller,
  });
}

function handleDeploy(argv) {
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
    seller,
  } = deployPreflight(argv);

  console.log('deploy', {
    privateKey,
    domain,
    verbose,
    url,
    chainId,
    registry,
    node,
    buyer,
    price,
    seller,
  });
}

function handleDeposit(argv) {
  const {
    escrow,
    privateKey,
    domain,
    verbose,
    url,
    chainId,
    registry,
  } = depositPreflight(argv);

  console.log('deposit', {
    escrow,
    privateKey,
    domain,
    verbose,
    url,
    chainId,
    registry,
  });
}

function handleBuy(argv) {
  const {
    escrow,
    privateKey,
    domain,
    verbose,
    url,
    chainId,
    registry,
  } = depositPreflight(argv);

  console.log('buy', {
    escrow,
    privateKey,
    domain,
    verbose,
    url,
    chainId,
    registry,
  });
}

yargs
  .help()
  .demandCommand()
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging',
  })
  .option('private-key', {
    alias: 'k',
    type: 'string',
    description: 'Use private key for transactions',
  })
  .option('url', {
    alias: 'u',
    type: 'string',
    description: 'Use Url for Zilliqa api',
  })
  .option('chain-id', {
    type: 'number',
    description: 'Use custom chain id for Zilliqa',
    default: 1,
  })
  .option('registry', {
    type: 'string',
    description: 'Use ZNS Registry contract address',
  })
  .demandOption('private-key')
  .epilog('Made with ' + chalk.red('♥') + ' by Unstoppable Domains')
  .command(
    'sell <domain>',
    'Deploy escrow contract',
    yargs =>
      yargs
        .positional('domain', {
          type: 'string',
          describe: 'domain to sell',
        })
        .option('buyer', {
          type: 'string',
          description: 'Buyer address',
        })
        .option('price', {
          type: 'number',
          description: 'Price to sell at',
        })
        .option('qa', {
          type: 'boolean',
          description: 'Use Qa instead of Zillings for price',
        })
        .option('seller', {
          type: 'string',
          description: 'Seller address',
        })
        .demandOption(['buyer', 'price']),
    handleSell,
  )
  .command(
    'deploy <domain>',
    'Deploy escrow contract',
    yargs =>
      yargs
        .positional('domain', {describe: 'domain to sell'})
        .option('buyer', {
          type: 'string',
          description: 'Buyer address',
        })
        .option('price', {
          type: 'number',
          description: 'Price to sell at',
        })
        .option('qa', {
          type: 'boolean',
          description: 'Use Qa instead of Zillings for price',
        })
        .option('seller', {
          type: 'string',
          description: 'Seller address',
        })
        .demandOption(['buyer', 'price']),
    handleDeploy,
  )
  .command(
    'deposit <domain>',
    'Deposit domain on contract',
    yargs =>
      yargs
        .positional('domain', {describe: 'domain to sell'})
        .option('escrow', {
          type: 'string',
          description: 'Escrow contract address',
        })
        .demandOption('escrow'),
    handleDeposit,
  )
  .command(
    'buy <domain>',
    'Purchase domain from contract',
    yargs =>
      yargs
        .positional('domain', {describe: 'domain to sell'})
        .option('escrow', {
          type: 'string',
          description: 'Escrow contract address',
        })
        .demandOption('escrow'),
    handleBuy,
  ).argv;
