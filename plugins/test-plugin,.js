/*
  1. webpack加载webpack.config.js中所有配置。此时就会new TestPlugin(), 执行插件的constructor
  2. webpack创建compiler对象
  3. 遍历所有plugins中插件，调用插件的apply方法
  4. 执行剩下编译流程（触发各个hooks事件）
*/ 


class TestPlugin {
  constructor(value) {
    this.value = value // 接收参数
    console.log('dd')
  }
  apply(compiler) {
    console.log('sss')

    compiler.hooks.enviroument.tap("TestPlugin", () => {
      console.log('enviroument')
    });

    // make 钩子函数 make是异步并行钩子（并行会同时执行）
    compilation.hooks.make.tapAsync("TestPlugin", (compilation, callback) => {
      setTimeout(() => {
        console.log("make 111")
        callback()
      }, 2000)
    })

    compilation.hooks.make.tapAsync("TestPlugin", (compilation, callback) => {
      setTimeout(() => {
        console.log("make 222")
        callback()
      }, 1000)
    })

    // emit 钩子函数 emit是异步串行钩子 （串行会按顺序执行）
    compiler.hooks.emit.tap("TestPlugin", (compilation, callback) => {
      setTimeout(() => {
        console.log("emit 111")
        callback()
      }, 1000)
    })

    compiler.hooks.emit.tapAsync("TestPlugin", (compilation, callback) => {
      setTimeout(() => {
        console.log("emit 222")
        callback()
      }, 3000)
    })

    compiler.hooks.emit.tapPromise("TestPlugin", () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log("emit 222")
          resolve()
        }, 2000)
      })
    })
  }
}

module.exports = TestPlugin;

// webpack 引入自定义 plugin 
// const TestPlugin = require('./plugins/test-plugin.js')
// 在 plugins 中调用
// new TestPlugin ()

// 执行顺序
/*
  enviroument
  make 111
  emit 111
  emit 222
  emit 333
*/