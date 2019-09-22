import logger from './log'

export function addToHistory({
  timestamp = Date.now(),
  message,
}: {
  timestamp?: number
  message: string
}) {
  logger.log(
    'history',
    JSON.stringify({
      timestamp,
      message,
    }),
  )
}
