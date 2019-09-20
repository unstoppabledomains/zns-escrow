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
