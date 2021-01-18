# LuckyEye

![](https://img.alicdn.com/tfs/TB1mhZBauuSBuNjy1XcXXcYjFXa-1080-700.png)

用于检查 Node.js 应用的各项问题，用于在出错的时候进行自助式快速排查的小工具。

## 使用

```sh
npm i @midwayjs/luckyeye --save-dev
npx luckyeye
```

在 `package.json` 中加入下面的包配置。

```json
{
  "midway-luckyeye": {
    "packages": [
      "midway_v2"
    ]
  }
}
```

`midway_v2` 是默认的针对 midway v2 的规则检查包。

也可以使用自己的 npm 包规则。

```json
{
  "midway-luckyeye": {
    "packages": [
      "npm:xxxx"
    ]
  }
}
```


## API

luckyeye 工具可以添加一些通用的检查项，目前没有实现插件机制，最好的方式就是进行提交 MR。

luckyeye 工具的想法是把检查项分为几个规则组，每个规则组里有对应的检查项，相当于 mocha 的两层维度，每个规则组目前由一个文件（函数）表示。

通过简单的 `register` 方法和传入的 runner 对象实现了一个简单的检查器。

目前 runner 支持输出消息，检查，警告这三类，同时也支持特定场景的忽略情况，支持同步和异步操作。

以下是简单的例子。

```js
exports.register = (runner) => {
  runner
    .group('基础环境检查')
    .skipWhen(() => {
      // 下面的就不走了
      return true;
    })
    .info('node 版本', () => {
      // 输出一些信息
      return 'v12.9.0'
    })
    .check('检查文件是否存在', () => {
      // 检查
      return [fs.existsSync('/home/admin/.image_info'), '未找到信息'];
    })
    .warn('警告', async () => {
      return [true, '输出警告的信息']
    });

};
```

runner 包括几个通用的输出接口

- group(groupName: string)
- check(title: string, () => {}) : Promise \<Array[result: boolean, failMessage: string]>
- info(title: string, () => {}) : Promise \<Array[message: string]>
- warn(title: string, () => {}) : Promise \<Array[result: boolean, warnMessage: string]>
- skipWhen(() => {}): Promise \<result: boolean> 返回true，则整段跳过执行，类似 xdescribe

接口很简单，看 /src/rule 目录下的例子就好。

如果要发布为 npm 包，需要导出包含 rules 属性的规则数组。

```js
exports.rules = [
  register
]
```

## Reporter

luckyeye 设计能支持多个不同的 Reporter，目前实现只有 ConsoleReporter。
