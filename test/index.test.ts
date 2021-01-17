import { ConsoleReporter, RunnerContainer } from '../src';
import * as os from 'os';

describe('/test/index.test.ts', () => {
  it('test create runner', () => {

    const defaultRule = (runner) => {
      runner
        .group('主机信息')
        .info('当前主机名', () => {
          return os.hostname;
        })
        .info('VM CPU', () => {
          return os.cpus().length;
        })
        .info('当前用户路径', () => {
          return os.homedir();
        });
    };

    const container = new RunnerContainer();
    container.registerReport(new ConsoleReporter());
    container.addRule(defaultRule);
  })
});