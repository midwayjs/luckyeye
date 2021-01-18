import queue from 'queue';
import { EventEmitter } from 'events';
import { getDynamicPackageVersion, getNpmList, getPackageVersion, hasPackage, versionCompare } from './util';
import { join } from 'path';
import { types, debuglog } from 'util';

const debugLogger = debuglog('midway:luckyeye');

const SLOW = 75;

const inner = {
  'base': require('./rule/base'),
  'midway_v2': require('./rule/app'),
};

export class RunnerContainer {

  reporters;
  baseDir;
  queue;
  mc;

  constructor(options?) {
    this.reporters = [];
    this.baseDir = options?.baseDir || process.cwd();
    this.queue = queue({
      timeout: 100,
      concurrency: 1,
      autostart: false,
    });
    this.mc = new EventEmitter();

    this.mc.on('luckyeye:result', (data) => {
      for (let reporter of this.reporters) {
        if (data.type === 'group') {
          reporter.reportGroup(data);
        } else if (data.type === 'info') {
          reporter.reportInfo(data);
        } else if (data.type === 'check') {
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

    this.queue.on('error', (err) => {
      this.reportError(err);
    });

    this.queue.on('end', (err) => {
      if (err) {
        console.error(err);
      }
      for (let reporter of this.reporters) {
        reporter.reportEnd();
      }
    });
  }

  loadRulePackage() {
    let packages = ['base'];
    try {
      const pkg = require(join(this.baseDir, `package.json`));
      packages = packages.concat(pkg['midway-luckyeye']['packages'] || []);
    } catch (err) {
    }

    if (packages.length) {
      for (const p of packages) {
        debugLogger(`[middway:luckyeye]: load rule package ${p}`);
        let ruleModule;
        if (p.indexOf(':') !== -1) {
          // 现在之后 npm
          ruleModule = require(p.split(':')[1]);
        } else if (inner[p]) {
          ruleModule = inner[p];
        }

        if (ruleModule['rules']) {
          for (const rule of ruleModule['rules']) {
            this.addRule(rule);
          }
        } else if (typeof ruleModule === 'function') {
          this.addRule(ruleModule);
        } else {
          console.log('not found rule and skip');
        }
      }
    }
  }

  async run() {
    return new Promise<void>((resolve, reject) => {
      this.queue.start((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  registerReport(reporter) {
    this.reporters.push(reporter);
    reporter.reportStart();
  }

  addRule(rule) {
    rule(new Runner(this));
  }

  report(data) {
    this.mc.emit('luckyeye:result', data);
  }

  reportError(err) {
    this.report({
      type: 'error',
      message: err.message,
    });
  }

  getBaseDir() {
    return this.baseDir;
  }

  getQueue() {
    return this.queue;
  }

  getMessageCenter() {
    return this.mc;
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

export class Runner {

  skip = false;
  innerGroup;
  baseDir;
  queue;
  mc;
  runnerContainer;
  utils = {
    getDynamicPackageVersion: getDynamicPackageVersion,
    getPackageVersion: getPackageVersion,
    getNpmList: getNpmList,
    hasPackage: hasPackage,
    versionCompare: versionCompare,
  };

  constructor(runnerContainer) {
    this.runnerContainer = runnerContainer;
    this.baseDir = runnerContainer.getBaseDir();
    this.queue = runnerContainer.getQueue();
    this.mc = runnerContainer.getMessageCenter();
  }

  getGroup() {
    return this.innerGroup;
  }

  group(value) {
    this.innerGroup = value;
    this.queue.push((cb) => {
      this.runnerContainer.report({
        type: 'group',
        group: this.innerGroup,
      });
      cb();
    });
    return this;
  }

  invoke(title, fn, dataHandler) {
    this.queue.push(async () => {
      if (types.isPromise(this.skip)) {
        this.skip = await this.skip;
      }

      if (this.skip) {
        this.runnerContainer.report({
          type: 'skip',
          title,
        });
      } else {
        let data: any;
        if (types.isPromise(fn)) {
          data = await fn;
        } else if (typeof fn === 'function') {
          data = await fn();
        } else {
          data = fn;
        }
        let test = dataHandler(data);
        isSlow(test);
        this.runnerContainer.report(test);
      }
    });
  }

  info(title, fn) {
    let startTime = Date.now();
    this.invoke(title, fn, (data) => {
      if (!Array.isArray(data)) {
        data = [data];
      }

      return {
        type: 'info',
        group: this.innerGroup,
        title: title,
        message: data[0],
        duration: Date.now() - startTime,
      };
    });
    return this;
  }

  check(title, assertFn) {
    let startTime = Date.now();
    this.invoke(title, assertFn(checkAssert), (data) => {
      if (!data.length) {
        data = [data, ''];
      }

      return {
        type: 'check',
        group: this.innerGroup,
        title: title,
        message: data[0],
        result: data[1],
        duration: Date.now() - startTime,
      };
    });
    return this;
  }

  warn(title, assertFn) {
    let startTime = Date.now();
    this.invoke(title, assertFn(checkAssert), (data) => {
      if (!data.length) {
        data = [data, ''];
      }

      return {
        type: 'warn',
        group: this.innerGroup,
        title: title,
        message: data[0],
        result: data[1],
        duration: Date.now() - startTime,
      };
    });

    return this;
  }

  skipWhen(checkFn) {
    this.skip = checkFn();
    return this;
  }

}

