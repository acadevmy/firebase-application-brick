/* eslint-disable @typescript-eslint/no-var-requires */
import fs from 'fs';
import killPort from 'kill-port';

const rawFirebase = fs.readFileSync('firebase.json', { encoding: 'utf8' });
const firebaseConfig = JSON.parse(rawFirebase);
const killTcpPort = async (port) => {
  try {
    await killPort(port);
  } catch (err) {
    if (err.message === 'No process running on port') {
      return;
    }
    // eslint-disable-next-line no-console
    console.error(`Port number: ${port}, could not be closed`, err);
  }
};
const killPortProcesses = Object.entries(firebaseConfig.emulators)
  .map(([, emulator]) => emulator.port)
  .filter(Boolean)
  .map(killTcpPort);
Promise.all(killPortProcesses).then(() => process.exit(0));
