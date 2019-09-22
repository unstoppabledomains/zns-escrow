import {homedir} from 'os'
import {join} from 'path'
import winston, {transports} from 'winston'

export default winston.createLogger({
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    verbose: 3,
    debug: 4,
    silly: 5,
    history: 6,
  },
  transports: [
    new transports.Console({
      level: 'silly',
    }),
    new transports.File({
      filename: join(homedir(), '.zns-escrow/history.log'),
      level: 'history',
    }),
  ],
})
