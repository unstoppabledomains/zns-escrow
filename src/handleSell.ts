import {sellPreflight} from './preflight';

export default function handleSell(argv) {
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
  } = sellPreflight(argv);

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
