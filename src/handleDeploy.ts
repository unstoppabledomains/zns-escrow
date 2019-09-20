import deploy from './actions/deploy';
import {deployPreflight} from './preflight';

export default function handleDeploy(argv) {
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

  return deploy({
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
