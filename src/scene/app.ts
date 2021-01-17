import { join } from 'path';

function checkoutAndOutputVersion(name) {
  try {
    return [require(`${name}/package`).version] 
  } catch(err) {
  }
  return ['?']
}

function checkoutMultiplePkg(baseDir, name) {
  try {
    return [require(`${name}/package`).version] 
  } catch(err) {
  }
  return ['?']
}

export const checkV2 = (runner) => {

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
      return [checkoutAndOutputVersion('@midwayjs/decorator')]
    })
    .info('midway core version', async () => {
      return [checkoutAndOutputVersion('@midwayjs/core')]
    })
    .info('midway logger version', async () => {
      return [checkoutAndOutputVersion('@midwayjs/logger')]
    })
    .info('midway mock version', async () => {
      return [checkoutAndOutputVersion('@midwayjs/mock')]
    })
    .info('midway web version', async () => {
      return [checkoutAndOutputVersion('@midwayjs/web')]
    })
    .check('multiple decorator', async () => {
      return [false, '']
    });
};
