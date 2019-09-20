import {createInterface} from 'readline';

const readlineInterface = createInterface(process.stdin, process.stdout);

export default async function ask(question = 'Continue?') {
  let answered;
  do {
    answered = await new Promise(resolve => {
      readlineInterface.question(question + ' [Y/n] ', answer => {
        if (/^(?:[Y|y](?:es)?)?$/.test(answer)) {
          resolve(true);
        } else if (/^(?:[N|n]o?)?$/.test(answer)) {
          console.log('Stopping...');
          process.exit(1);
        } else {
          resolve(false);
        }
      });
    });
  } while (!answered);
}
