import {toBech32Address} from '@zilliqa-js/crypto';
import {bytes} from '@zilliqa-js/util';
import {Zilliqa} from '@zilliqa-js/zilliqa';

let hasLoggedBefore = false;

export default function getUtils({privateKey, verbose, url, chainId}) {
  const zilliqa = new Zilliqa(url);
  const address = zilliqa.wallet.addByPrivateKey(privateKey);
  zilliqa.wallet.setDefault(address);

  const version = bytes.pack(chainId, 1);

  if (verbose && !hasLoggedBefore) {
    hasLoggedBefore = true;

    console.info('Using url:', url);
    console.info('Using version:', version);
    console.info('Using address:', address);
    console.info('Using bech32 address:', toBech32Address(address));
  }

  return {address, version, zilliqa};
}
