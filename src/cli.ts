import chalk from 'chalk';
import * as yargs from 'yargs';
import handleBuy from './handleBuy';
import handleDeploy from './handleDeploy';
import handleDeposit from './handleDeposit';
import handleSell from './handleSell';

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
    // ['sell <domain>', '$0 <domain>'],
    'sell <domain>',
    'Deploy escrow contract and deposit name onto contract',
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
