import { execSync } from 'child_process';
import * as os from 'os';

export const baseCheck = (runner) => {
  runner
    .group('Base check')
    .info('Hostname', () => {
      return os.hostname;
    })
    .info('VM CPU', () => {
      return os.cpus().length;
    })
    .info('USER HOME', () => {
      return os.homedir();
    })
    .info('Node.js Version', () => {
      try {
        return execSync(`node -v`).toString().trim();
      } catch (err) {
        return '?';
      }
    })
    .info('NPM Version', () => {
      try {
        return execSync(`npm -v`).toString().trim();
      } catch (err) {
        return '?';
      }
    });
};

exports.rules = [
  baseCheck,
]
