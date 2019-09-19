# ZNS Escrow Tools

## Installation

A cli to deploy and use these contracts is available on the npm registry.

```
yarn global add zns-escrow
```

```
npm -G install zns-escrow
```

## Use

For detailed instructions on how to use the cli. Use

```
zns-escrow --help
```

### Example

#### Sellers

Deploy escrow and deposit domain.

```
buyer_address=0x1234567890123456789012345678901234567890
seller_private_key=$(cat seller_private_key.txt)
domain=any.zil

zns-escrow sell \
  --domain $domain \
  --buyer $buyer_address \
  --price 1 --qa \
  --private-key $seller_private_key
```

##### Or if you want to separate these steps.

Deploy the contract.

```
buyer_address=0x1234567890123456789012345678901234567890
seller_private_key=$(cat seller_private_key.txt)
domain=any.zil

zns-escrow deploy \
  --domain $domain \
  --buyer $buyer_address \
  --price 1 --qa \
  --private-key $seller_private_key
```

Then escrow the domain.

```
escrow_address=0x1234567890123456789012345678901234567890
seller_private_key=$(cat seller_private_key.txt)

zns-escrow deposit \
  --escrow-address $escrow_address \
  --private-key $seller_private_key
```

#### Buyers

Purchase an escrowed domain.

```
escrow_address=0x1234567890123456789012345678901234567890
buyer_private_key=$(cat buyer_private_key.txt)

zns-escrow buy \
  --escrow-address $escrow_address \
  --private-key $buyer_private_key
```

## Additional Information

- Test-net ZIL is distributed at the [Nucleus Wallet Faucet](https://dev-wallet.zilliqa.com/home).
- Transactions take no more than 10 minutes to mine. If a transaction is still in the pool after 10 minutes, try again.

## Development Requirements

- [Scilla Toolchain](https://github.com/Zilliqa/scilla)
  - [Docs](https://scilla.readthedocs.io/)

## Scilla Contract
