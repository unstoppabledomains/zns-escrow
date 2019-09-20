import {toBech32Address} from '@zilliqa-js/crypto';
import {BN, Long} from '@zilliqa-js/util';
import ask from '../ask';
import error from '../error';
import getUtils from '../getUtils';
import zilliqaRpcWrap from '../zilliqaRpcWrap';

export default async function deploy(argv: {
  privateKey: string;
  domain: string;
  verbose: boolean;
  url: string;
  chainId: number;
  registry: string;
  node: string;
  buyer: string;
  price: number;
  seller: string;
}) {
  const {version, zilliqa, address} = getUtils(argv);
  const {domain, verbose, registry, node, buyer, price, seller} = argv;

  const init = [
    {vname: '_scilla_version', type: 'Uint32', value: '0'},
    {vname: 'registry', type: 'ByStr20', value: registry},
    {vname: 'seller', type: 'ByStr20', value: seller},
    {vname: 'buyer', type: 'ByStr20', value: buyer},
    {vname: 'escrowedNode', type: 'ByStr32', value: node},
    {vname: 'price', type: 'Uint128', value: price},
  ];

  const strPrice = (price / 10 ** 12).toFixed(4);
  console.log(
    `Selling ${domain} to ${toBech32Address(buyer)} for ${
      strPrice === '0.0000' ? '~0' : strPrice
    } ZIL...`,
  );

  await ask('Continue?');

  if (seller !== address) {
    await ask(`You are selling on behalf of ${seller}. Still Continue?`);
  }

  console.log('Broadcasting...');

  console.log(address);

  const balance = await zilliqaRpcWrap(zilliqa.blockchain.getBalance(address));

  const signed = await zilliqa.wallet.sign(
    zilliqa.transactions.new({
      version,
      gasPrice: new BN(10 ** 9),
      gasLimit: Long.fromNumber(10000),
      nonce: balance.nonce + 1,
      pubKey: zilliqa.wallet.defaultAccount!.publicKey,
      toAddr: '0x0000000000000000000000000000000000000000',
      amount: new BN(0),
      data: JSON.stringify(init),
    }),
  );

  console.dir(signed, {depth: Infinity});

  const tx = await zilliqa.blockchain.createTransaction(signed, 30, 20, true);

  console.log('Done!');

  if (tx.isRejected()) {
    console.error('tx', JSON.stringify(tx.txParams));
    error('transaction was rejected');
  }
}
