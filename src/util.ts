import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import * as supportsColor from 'supports-color';
import { compare } from 'semver';

/**
 * Enable coloring by default, except in the browser interface.
 */

exports.useColors = (supportsColor || (process.env.MOCHA_COLORS !== undefined));


/**
 * Default color map.
 */

export const colors = {
  pass: 90,
  fail: 31,
  'bright pass': 92,
  'bright fail': 91,
  'bright yellow': 93,
  pending: 36,
  suite: 0,
  'error title': 0,
  'error message': 31,
  'error stack': 90,
  checkmark: 32,
  fast: 90,
  medium: 90,
  slow: 90,
  green: 32,
  light: 90,
  'diff gutter': 90,
  'diff added': 32,
  'diff removed': 31,
  info: 94,
  warn: 93,
};

/**
 * Default symbol map.
 */

export const symbols = {
  ok: '✓',
  err: '✖',
  dot: '․',
  comma: ',',
  bang: '!',
  info: '¤ ',
  warn: '!️',
};

// With node.js on Windows: use symbols available in terminal default fonts
if (process.platform === 'win32') {
  exports.symbols.ok = '\u221A';
  exports.symbols.err = '\u00D7';
  exports.symbols.dot = '.';
}

export const color = function (type, str) {
  if (!exports.useColors) {
    return String(str);
  }
  return '\u001b[' + exports.colors[type] + 'm' + str + '\u001b[0m';
};

export function getDynamicPackageVersion(name): string {
  try {
    return require(`${name}/package`).version;
  } catch(err) {
  }
  return '?';
}

export async function getNpmList(dirPath: string, dataMap, level = 1) {
  if (level > 5 || !existsSync(dirPath)) {
    return;
  }
  const fileList = readdirSync(dirPath);
  return Promise.all(fileList.map(async file => {
    if (file[0] === '_') {
      // ignore tnpm module name
      return;
    }
    const filePath = join(dirPath, file);
    const fileStat = statSync(filePath);
    if (!fileStat.isDirectory()) {
      return;
    }
    // npm group
    if (file[0] === '@') {
      return getNpmList(filePath, dataMap, level++);
    }

    const pkgJson = join(filePath, 'package.json');
    if (!existsSync(pkgJson)) {
      return;
    }
    const { name, version } = JSON.parse(readFileSync(pkgJson).toString());
    if (!dataMap[name]) {
      dataMap[name] = {};
    }
    if (!dataMap[name][version]) {
      dataMap[name][version] = 0;
    }
    dataMap[name][version] ++;
    return getNpmList(join(filePath, 'node_modules'), dataMap, level ++);
  }));
}

export function hasPackage(baseDir, packageName, isDev = false) {
  try {
    const pkg = require(join(baseDir, 'package.json'));
    if (isDev) {
      return !!pkg['devDependencies'][packageName];
    } else {
      return !!pkg['dependencies'][packageName];
    }
  } catch (err) {}
  return false;
}

export function getPackageVersion(baseDir, packageName, isDev = false) {
  try {
    const pkg = require(join(baseDir, 'package.json'));
    if (isDev) {
      return pkg['devDependencies'][packageName];
    } else {
      return pkg['dependencies'][packageName];
    }
  } catch (err) {}
  return undefined;
}

export function versionCompare(current, target) {
  return compare(current, target);
}
