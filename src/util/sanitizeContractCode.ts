import {readFileSync, writeFileSync} from 'fs'
import {join} from 'path'

export default function sanitizeContractCode(str) {
  let commentStart
  let commentEnd
  let str1
  let str2
  let str3
  const originalStr = str

  try {
    // loop till all comments beginning with '(*' are removed
    while ((commentStart = str.match(/\(\*/))) {
      // get the string till comment start
      str1 = str.substr(0, commentStart.index)

      // get the string after comment start
      str2 = str.substr(commentStart.index)
      commentEnd = str2.match(/\*\)/)
      str3 = str2.substr(commentEnd.index + 2)

      str = str1 + str3
    }
  } catch (e) {
    return originalStr
  }

  return str
    .replace(/ +/g, ' ')
    .replace(/\n+(?: +)?/g, '\n')
    .replace(/\t/g, '')
    .replace(/\n+$/, '')
    .replace(/\\"/g, '"')
}

if (module === require.main) {
  writeFileSync(
    './c.scilla',
    sanitizeContractCode(
      readFileSync(join(__dirname, '../contracts/escrow.scilla'), 'utf8'),
    ),
  )
}
