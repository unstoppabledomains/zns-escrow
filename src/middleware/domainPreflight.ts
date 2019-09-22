import namehash from 'namicorn/lib/zns/namehash'
import error from '../util/error'

type WithNode<T extends {}> = T & {
  node?: string
}

export default function domainPreflight<T extends {domain?: string}>(
  argv: T,
): WithNode<T> {
  if (argv.domain) {
    let node
    try {
      node = namehash(argv.domain.replace(/(\.zil)?$/, '.zil'))
    } catch (err) {
      error('bad domain', true)
    }

    ;(argv as any).node = node
  }

  return argv
}
