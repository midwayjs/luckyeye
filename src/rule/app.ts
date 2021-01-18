import { join } from 'path';
import { Runner } from '..';
import { execSync } from 'child_process';

export const checkV2 = (runner: Runner) => {

  let npmList = {};

  runner
    .group('Midway v2 check')
    .skipWhen(async () => {
      try {
        const baseDir = runner.baseDir;
        if (runner.utils.hasPackage(baseDir, '@midwayjs/decorator')) {
          await runner.utils.getNpmList(join(baseDir, 'node_modules'), npmList);
          return false;
        }
        return true;
      } catch (err) {
      }
      return true;
    })
    .info('midway decorator version', async () => {
      return [runner.utils.getDynamicPackageVersion('@midwayjs/decorator')];
    })
    .info('midway core version', async () => {
      return [runner.utils.getDynamicPackageVersion('@midwayjs/core')];
    })
    .info('midway logger version', async () => {
      return [runner.utils.getDynamicPackageVersion('@midwayjs/logger')];
    })
    .info('midway mock version', async () => {
      return [runner.utils.getDynamicPackageVersion('@midwayjs/mock')];
    })
    .info('midway web version', async () => {
      return [runner.utils.getDynamicPackageVersion('@midwayjs/web')];
    })
    .check('Check Node.js Version（>=12）', () => {
      try {
        let ver = execSync(`node -v`).toString().trim();
        const marjorVersion = ver.split('.')[0].replace('v', '');
        return [parseInt(marjorVersion) >= 12, `Node.js version too low`];
      } catch (err) {
        return [false, 'Check error'];
      }
    })
    .check('multiple @midwayjs/decorator', async () => {
      if (npmList['@midwayjs/decorator'] && Object.keys(npmList['@midwayjs/decorator']).length > 1) {
        return [false, 'multile @midwayjs/decorator version find, version =' + Object.keys(npmList['@midwayjs/decorator'])];
      } else {
        return [true];
      }
    })
    .check('multiple @midwayjs/core', async () => {
      if (npmList['@midwayjs/core'] && Object.keys(npmList['@midwayjs/core']).length > 1) {
        return [false, 'multile @midwayjs/core version find, version =' + Object.keys(npmList['@midwayjs/core'])];
      } else {
        return [true];
      }
    })
    .check('old midway-bin must be removed', async () => {
      if (runner.utils.hasPackage(runner.baseDir, 'midway-bin', true)) {
        return [false, 'must be remove midway-bin package'];
      }
      return [true];
    })
    .check('old midway-mock must be removed', async () => {
      if (runner.utils.hasPackage(runner.baseDir, 'midway-mock', true)) {
        return [false, 'must be remove midway-mock package'];
      }
      return [true];
    })
    .warn('upgrade to ts 4.1', async () => {
      const version = runner.utils.getPackageVersion(runner.baseDir, 'typescript', true);
      if (runner.utils.versionCompare(version.replace('^', ''), '4.1.0') === -1) {
        return [true, 'more powerful'];
      }
      return [false];
    });
};

exports.rules = [
  checkV2,
];
