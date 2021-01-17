import queue from 'queue';
import { EventEmitter } from 'events';

const q = queue({
  timeout: 100,
  concurrency: 1,
  autostart: true,
});

const SLOW = 75;

const mc = new EventEmitter();

export class RunnerContainer {

  reporters;
  ready: boolean;

  constructor() {
    this.reporters = [];
    this.ready = false;

    mc.on('luckyeye:result', (data) => {
      for (let reporter of this.reporters) {
        if (data.type === 'group') {
          reporter.reportGroup(data);
        } else if (data.type === 'info') {
          reporter.reportInfo(data);
        } else if (data.type === 'check') {
          this.ready = true;
          reporter.reportCheck(data);
        } else if (data.type === 'warn') {
          reporter.reportWarn(data);
        } else if (data.type === 'skip') {
          reporter.reportSkip(data);
        } else if (data.type === 'error') {
          reporter.reportError(data);
        }
      }
    });

    q.on('end', () => {
      if (this.ready) {
        for (let reporter of this.reporters) {
          reporter.reportEnd();
        }
      }
    });
  }

  registerReport(reporter) {
    this.reporters.push(reporter);
    reporter.reportStart();
  }

  addRule(rule) {
    rule(new Runner());
  }
}

function checkAssert(result) {
  return !!result;
}

function isSlow(test) {
  if (test.duration > SLOW) {
    test.speed = 'slow';
  } else if (test.duration > SLOW / 2) {
    test.speed = 'medium';
  } else {
    test.speed = 'fast';
  }
}

class Runner {

  skip = false;
  innerGroup;

  getGroup() {
    return this.innerGroup;
  }

  group(value) {
    this.innerGroup = value;
    q.push((cb) => {
      this.report({
        type: 'group',
        group: this.innerGroup,
      });
      cb();
    });
    return this;
  }

  info(title, fn) {
    if (this.skip) {
      q.push((cb) => {
        this.report({
          type: 'skip',
          title,
        });
        cb();
      });
      return this;
    }

    let startTime = Date.now();
    q.push(() => {
      return Promise.resolve(fn()).then((data) => {
        if(!Array.isArray(data)) {
          data = [data];
        }

        let test = {
          type: 'info',
          group: this.innerGroup,
          title: title,
          message: data[0],
          duration: Date.now() - startTime,
        };

        isSlow(test);
        this.report(test);
      }).catch((err) => {
        this.reportError(err);
      });
    });

    return this;
  }

  check(title, assertFn) {
    if (this.skip) {
      q.push((cb) => {
        this.report({
          type: 'skip',
          title,
        });
        cb();
      });
      return this;
    }

    let startTime = Date.now();

    q.push(() => {
      return Promise.resolve(assertFn(checkAssert)).then((data) => {

        if(!data.length) {
          data = [data, ''];
        }

        let test = {
          type: 'check',
          group: this.innerGroup,
          title: title,
          message: data[0],
          result: data[1],
          duration: Date.now() - startTime,
        };

        isSlow(test);
        this.report(test);
      }).catch((err) => {
        this.reportError(err);
      });
    });

    return this;
  }

  warn(title, assertFn) {
    if (this.skip) {
      q.push((cb) => {
        this.report({
          type: 'skip',
          title,
        });
        cb();
      });
      return this;
    }

    let startTime = Date.now();

    q.push(() => {
      return Promise.resolve(assertFn(checkAssert)).then((data) => {

        if(!Array.isArray(data)) {
          data = [data, ''];
        }

        let test = {
          type: 'warn',
          group: this.innerGroup,
          title: title,
          message: data[0],
          result: data[1],
          duration: Date.now() - startTime,
        };

        isSlow(test);
        this.report(test);
      }).catch((err) => {
        this.reportError(err);
      });
    });

    return this;
  }

  report(data) {
    mc.emit('luckyeye:result', data);
  }

  skipWhen(checkFn) {
    this.skip = checkFn();
    return this;
  }

  reportError(err) {
    q.push((cb) => {
      this.report({
        type: 'error',
        group: this.innerGroup,
        message: err.message,
      });
      cb();
    });
  }

}
