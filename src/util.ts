import * as supportsColor from 'supports-color';

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

export function getPackageVersion(name): string {
  try {
    return require(`${name}/package`).version;
  } catch(err) {
  }
  return '?';
}