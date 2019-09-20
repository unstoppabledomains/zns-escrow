import {BN, Long} from '@zilliqa-js/util';
import error from '../error';
import getUtils from '../getUtils';
import zilliqaRpcWrap from '../zilliqaRpcWrap';

function setIntervalFor(cb, interval, length) {
  return new Promise(resolve => {
    let count = 0;
    const i = setInterval(() => {
      count++;
      cb(count);
    });
    setTimeout(() => {
      clearInterval(i);
      resolve();
    }, length);
  });
}

export default async function buy(argv: {
  escrow: string;
  privateKey: string;
  domain: string;
  verbose: boolean;
  url: string;
  chainId: number;
  registry: string;
  node: string;
}) {
  const {version, zilliqa, address} = getUtils(argv);
  const {escrow, domain, verbose, registry, node} = argv;

  /* const escrowContract = zilliqa.contracts.at(address);

  const [init, state] = await Promise.all([
    escrowContract.getInit(),
    escrowContract.getState(),
  ]);

  if (!init || !state) {
    error('contract does not exist');
  }

  if (state.id !== 'udc:escrow:1') {
    error(`'${escrow}' is not an escrow contract`);
  }

  if (state.registry !== registry) {
    error(`'${domain}' on a different registry`);
  }

  if (state.sold.constructor === 'True') {
    error(`'${domain}' already sold`);
  }

  if (init.escrowedNode !== node) {
    error("wrong escrow contract, domains don't match");
  }

  if (verbose) {
    console.info('Registry:', state.registry);
    console.info('Seller:', state.seller);
  }

  const strPrice = (init.price / 10 ** 12).toFixed(4);
  console.log(
    `Buying ${domain} from ${toBech32Address(state.seller)} for ${
      strPrice === '0.0000' ? '~0' : strPrice
    }ZIL...`,
  );

  await ask('Continue?');

  if (init.buyer !== address) {
    await ask(`You are buying on behalf of ${state.buyer}. Still Continue?`);
  } */

  // setIntervalFor(
  //   (count) => {
  //     const date = new Date(count * 15000);
  //     if (verbose)
  //       console.log(
  //         `Broadcasted ${count} times... ${date.getMinutes()}:${date
  //           .getSeconds()
  //           .toString()
  //           .padStart(2, '0')} elapsed`,
  //       );
  //   },
  //   30000,
  //   600000,
  // ),

  console.log('Broadcasting...');

  console.log(address);

  const balance = await zilliqaRpcWrap(
    zilliqa.blockchain.getBalance(
      address,
      // .toLowerCase().replace(/^0x/, '')
    ),
  );

  const signed = await zilliqa.wallet.sign(
    zilliqa.transactions.new({
      version,
      gasPrice: new BN(10 ** 9),
      gasLimit: Long.fromNumber(10000),
      nonce: balance.nonce + 1,
      pubKey: zilliqa.wallet.defaultAccount!.publicKey,
      toAddr: escrow,
      amount: new BN('1'), // state.price),
      // data: JSON.stringify({_tag: 'buy', params: []}),
    }),
  );

  console.dir(signed, {depth: Infinity});

  const tx = await zilliqa.blockchain.createTransaction(signed, 30, 20, true);

  console.log('Done!');

  if (tx.isRejected()) {
    console.error('tx', JSON.stringify(tx.txParams));
    error('transaction was rejected');
  }

  if (
    tx.isConfirmed() &&
    tx.txParams.receipt!.event_logs.find(e => e._eventname === 'Success')
  ) {
    console.log('Success!');
  }
}
