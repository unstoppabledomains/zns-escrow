import buy from './actions/buy';
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
    node,
  } = buyPreflight(argv);

  return buy({
    escrow,
    privateKey,
    domain,
    verbose,
    url,
    chainId,
    registry,
    node,
  });
}
