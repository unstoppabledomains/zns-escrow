import {normaliseAddress, toBech32Address} from '@zilliqa-js/crypto'
import {bytes} from '@zilliqa-js/util'
import {Zilliqa} from '@zilliqa-js/zilliqa'
import error from '../util/error'

type WithZilliqa<T extends {}, R extends boolean> = T & {
  zilliqa: Zilliqa
  address: string
  privateKey: string
  url: string
  version: number
  registry: R extends true ? string : void
}

export default function zilliqaPreflight<
  T extends {
    privateKey?: string
    url?: string
    chainId?: number
    registry?: string
  },
  R extends boolean
>(needsRegistry: R): (argv: T) => WithZilliqa<T, R> {
  return argv => {
    let {url, privateKey, chainId, registry} = argv

    switch (chainId) {
      case 1: {
        if (!url) argv.url = 'https://api.zilliqa.com/'

        if (needsRegistry && !registry) {
          argv.registry = normaliseAddress(
            toBech32Address('0x9611c53be6d1b32058b2747bdececed7e1216793'),
          )
        }
        break
      }
      case 333: {
        if (!url) argv.url = 'https://dev-api.zilliqa.com/'
        if (needsRegistry) {
          if (!registry) {
            error('must supply registry using testnet', true)
          } else {
            argv.registry = normaliseAddress(registry)
          }
        }
        break
      }
      case 111: {
        error('cannot use kaya', true)
        if (!url) argv.url = 'https://localhost:4200/'
        if (needsRegistry) {
          if (!registry) {
            error('must supply registry using kaya', true)
          } else {
            argv.registry = normaliseAddress(registry)
          }
        }
        break
      }
      default: {
        if (!url) error('must supply url using private chain', true)
        if (needsRegistry) {
          if (!registry) {
            error('must supply registry using private chain', true)
          } else {
            argv.registry = normaliseAddress(registry)
          }
        }
      }
    }

    const zilliqa = new Zilliqa(argv.url!)
    ;(argv as any).zilliqa = zilliqa

    let address
    if (privateKey) {
      if (!/^[a-f\d]{64}|[A-F\d]{64}$/.test(privateKey)) {
        error('bad private key', true)
      }

      address = zilliqa.wallet.addByPrivateKey(privateKey)
      zilliqa.wallet.setDefault(address)
      ;(argv as any).address = address
    }

    ;(argv as any).version = bytes.pack(chainId || 1, 1)

    return argv as any
  }
}
