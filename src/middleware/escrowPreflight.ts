import {normaliseAddress} from '@zilliqa-js/crypto'
import error from '../util/error'

export default function escrowPreflight<T extends {escrow: string}>(
  argv: T,
): T {
  try {
    argv.escrow = normaliseAddress(argv.escrow!)
  } catch (err) {
    error('bad escrow', true)
  }
  return argv
}
