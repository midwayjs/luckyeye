import { color, symbols } from './util';
import * as ms from 'ms';

const indents = 0;
let n = 0;

function indent() {
  return Array(indents).join('  ');
}

export class Reporter {
  reportStart() {
  }

  reportEnd() {
  }

  reportGroup(data) {
  }

  reportInfo(data) {
  }

  reportCheck(data) {
  }

  reportError(data) {
  }

  reportSkip(data) {
  }

  reportWarn(data) {
  }
}

export class ConsoleReporter extends Reporter {

  passes = 0;
  failures = 0;
  pending = 0;
  warning = 0;
  startTime = Date.now();

  reportEnd() {
    console.log();
    // passes
    let fmt = color('bright pass', ' ') +
      color('green', ' %d passing') +
      color('light', ' (%s)');

    console.log(fmt, this.passes, ms(Date.now() - this.startTime));

    // pending
    if (this.pending) {
      fmt = color('pending', ' ') +
        color('pending', ' %d pending');

      console.log(fmt, this.pending);
    }

    if (this.warning) {
      fmt = color('warn', ' ') +
        color('warn', ' %d warning');

      console.log(fmt, this.warning);
    }

    // failures
    if (this.failures) {
      fmt = color('fail', '  %d failing');
      console.log(fmt, this.failures);
    }
    console.log();
  }

  reportGroup(data) {
    console.log();
    console.log(color('suite', '  %s%s'), indent(), data.group);
    console.log();
  }

  reportInfo(data) {
    this.output(data);
  }

  reportCheck(data) {
    this.output(data);
  }

  reportWarn(data) {
    this.output(data);
  }

  output(test) {
    if (test.type === 'check' && !test.message) {
      this.failures++;
      console.log(indent() + color('fail', '  %d) %s => (%s)'), ++n, test.title, test.result || 'false');
    } else {
      if (test.type === 'check') {
        this.passes++;
      }

      if (test.type === 'warn') {
        if(test.message) {
          this.warning++;
        } else {
          this.passes++;
        }
      }

      let fmt;

      let symbol, checkmarkColor, passColor;
      switch(test.type) {
        case 'info':
          symbol = symbols.info;
          checkmarkColor = 'info';
          passColor = 'info';
          break;
        case 'warn':
          symbol = test.message ? symbols.warn : symbols.ok;
          checkmarkColor = test.message ? 'warn': 'checkmark';
          passColor = test.message ? 'warn': 'pass';
          break;
        default:
          symbol = symbols.ok;
          checkmarkColor = 'checkmark';
          passColor = 'pass';
      }

      if (test.speed === 'fast') {
        fmt = indent() +
          color(checkmarkColor, '  ' + symbol) +
          color(passColor, ' %s');

        if(test.type === 'warn' && test.message) {
          console.log(fmt, `${test.title} => ${test.result || '?'}`);
        } else {
          console.log(fmt, `${test.title} => ${test.message || '?'}`);
        }
      } else {
        fmt = indent() +
          color(checkmarkColor, '  ' + symbol) +
          color(passColor, ' %s') +
          color(test.speed, ' (%dms)');

        if(test.type === 'warn' && test.message) {
          console.log(fmt, `${test.title} => ${test.result || '?'}`);
        } else {
          console.log(fmt, `${test.title} => ${test.message || '?'}`, test.duration);
        }
      }
    }
  }

  reportError(data) {
    console.log(data.message);
  }

  reportSkip(data) {
    this.pending++;
    let fmt = indent() + color('pending', '  - %s');
    console.log(fmt, data.title);
  }
}
