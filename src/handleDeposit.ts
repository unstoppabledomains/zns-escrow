import {depositPreflight} from './preflight';

export default function handleDeposit(argv) {
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
