import {buyPreflight} from './preflight';

export default function handleBuy(argv) {
  const {
    escrow,
    privateKey,
    domain,
    verbose,
    url,
    chainId,
    registry,
  } = buyPreflight(argv);

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
