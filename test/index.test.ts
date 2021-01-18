import { ConsoleReporter, RunnerContainer } from '../src';
import * as os from 'os';
import { execSync } from 'child_process';
import { join } from 'path';

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

  it('should load package from app pkg', () => {
    const bin = join(__dirname, '../bin/luckyeye');
    const result = execSync(`${bin}`, {
      cwd: join(__dirname, './fixtures/base-app')
    });

    expect(result.toString()).toContain('Midway v2 check');
  });
});