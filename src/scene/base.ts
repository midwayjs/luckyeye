import { execSync } from 'child_process';

export const baseCheck = (runner) => {
  runner
    .group('Base check')
    .warn('Check Node.js Version（>=12）', () => {
      try {
        let ver = execSync(`node -v`).toString().trim();
        const marjorVersion = ver.split('.')[0].replace('v', '');
        return [parseInt(marjorVersion) < 12, `Node.js version too low`];
      } catch (err) {
        return [false, 'Check error'];
      }
    });
};
