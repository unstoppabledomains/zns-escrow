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

Deploy the contract.

```sh
zns-escrow deploy any.zil \
  --buyer zil1zg69v7yszg69v7yszg69v7yszg69v7ysrug0xt \
  --price 1 --qa \
  --private-key $(cat seller_private_key.txt)
```

Then escrow the domain.

```sh
zns-escrow deposit domain zil1zg69v7yszg69v7yszg69v7yszg69v7ysrug0xt --private-key $(cat seller_private_key.txt)
```

#### Buyers

Deposit an escrowed domain.

```
zns-escrow deposit zil zil1zg69v7yszg69v7yszg69v7yszg69v7ysrug0xt --private-key $(cat buyer_private_key.txt)
```

Then execute the escrow.

Deposit an escrowed domain.

```
zns-escrow exchange zil1zg69v7yszg69v7yszg69v7yszg69v7ysrug0xt --private-key $(cat buyer_private_key.txt)
```

## Additional Information

- Test-net ZIL is distributed at the [Nucleus Wallet Faucet](https://dev-wallet.zilliqa.com/home).
- Transactions take no more than 10 minutes to mine. If a transaction is still in the pool after 10 minutes, try again.

## Development Requirements

- [Scilla Toolchain](https://github.com/Zilliqa/scilla)
  - [Docs](https://scilla.readthedocs.io/)
