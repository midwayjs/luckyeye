import { ConsoleReporter, RunnerContainer } from '../src';
import * as os from 'os';
import { join } from 'path';
import { existsSync } from 'fs';
import { execSync } from 'child_process';

describe('/test/index.test.ts', () => {
  it('test create runner', async () => {

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
    await container.run();
  })

  it('should load package from app pkg', async () => {

    const baseDir = join(__dirname, './fixtures/base-app');
    if (!existsSync(join(baseDir, 'node_modules'))) {
      execSync('npm install');
    }

    const container = new RunnerContainer({
      baseDir: join(__dirname, './fixtures/base-app')
    });
    container.registerReport(new ConsoleReporter());
    container.loadRulePackage();
    await container.run();
  });
});
