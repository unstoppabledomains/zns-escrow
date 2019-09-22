import {RPCResponse} from '@zilliqa-js/core'

export default function zilliqaRpcWrap<R = any, E = any>(
  promise: Promise<RPCResponse<R, E>>,
): Promise<R> {
  return promise.then(({result, error}) => {
    if (error) {
      console.error(error)
      throw new Error(error.message)
    }
    return result!
  })
}
