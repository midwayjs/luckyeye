# LuckyEye

![](https://img.alicdn.com/tfs/TB1mhZBauuSBuNjy1XcXXcYjFXa-1080-700.png)

用于检查 Node.js 应用的各项问题，用于在出错的时候进行自助式快速排查的小工具。

## 使用

```sh
./node_modules/.bin/luckyeye
```

## API

luckyeye 工具可以添加一些通用的检查项，目前没有实现插件机制，最好的方式就是进行提交 MR。

luckyeye 工具的想法是把检查项分为几个场景，每个场景里有对应的检查项，相当于 mocha 的两层维度，每个场景目前由一个文件表示。

通过简单的 `register` 方法和传入的 runner 对象实现了一个简单的检查器。

目前 runner 支持输出消息，检查，警告这三类，同时也支持特定场景的忽略情况，支持同步和异步操作。

以下是简单的例子，也可以参考现有的[检查项](http://gitlab.alibaba-inc.com/taobao-node/luckyeye/blob/master/scene/base.js)

```js
exports.register = (runner) => {
  runner
    .group('基础环境检查')
    .check('检查是否使用 docker 构建', () => {
      return [fs.existsSync('/home/admin/.image_info'), '未找到信息'];
    })
    .check('检查磁盘容量', () => {
      let result = false;
      return new Promise((resolve) => {
        df({
          file: '/',
        }, function (error, response) {
          let msg = '';
          if (error) {
            msg = '检查磁盘出现错误';
          } else if(response.length === 0) {
            msg = '未找到磁盘';
          } else {
            result = response[0].capacity < '0.8';
            msg = `${response[0].capacity * 100}%`;
          }
          resolve([result, msg]);
        });
      });
    });

};
```

runner 包括几个通用的输出接口

- group(groupName: string)
- check(title: string, () => {}) : Promise \<Array[result: boolean, failMessage: string]>
- info(title: string, () => {}) : Promise \<Array[message: string]>
- warn(title: string, () => {}) : Promise \<Array[result: boolean, warnMessage: string]>
- skipWhen(() => {}): Promise \<result: boolean> 返回true，则整段跳过执行，类似 xdescribe

接口很简单，看 /scene 目录下的例子就好


## Reporter

luckyeye 设计能支持多个不同的 Reporter，目前实现只有 ConsoleReporter。