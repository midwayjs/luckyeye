import { join } from 'path';
import { Runner } from '..';

export const checkV2 = (runner: Runner) => {

  runner
    .group('Midway v2 check')
    .skipWhen(()=> {
      try {
        const baseDir = process.cwd();
        const pkg = require(join(baseDir, 'package.json'));
        if(pkg['dependencies']['@midawyjs/decorator']) {
          return false;
        }
        return true;
      } catch (err) {}
      return true;
    })
    .info('midway decorator version', async () => {
      return [runner.utils.getPackageVersion('@midwayjs/decorator')]
    })
    .info('midway core version', async () => {
      return [runner.utils.getPackageVersion('@midwayjs/core')]
    })
    .info('midway logger version', async () => {
      return [runner.utils.getPackageVersion('@midwayjs/logger')]
    })
    .info('midway mock version', async () => {
      return [runner.utils.getPackageVersion('@midwayjs/mock')]
    })
    .info('midway web version', async () => {
      return [runner.utils.getPackageVersion('@midwayjs/web')]
    })
    .check('multiple decorator', async () => {
      return [false, '']
    });
};

exports.rules = [
  checkV2,
]