// 自定义 loader

// 同步loader 
module.exports = function (content, map, meta) {
  // 参数一，err 代表是否错误
  // 参数二，content 代表处理后的内容
  // 参数三，source-map 继续传递 source-map
  // 参数四，meta 给下一loader传递参数
  tihs.callback(null, content, map, meta);
}

// 异步loader
module.exports = function (content, map, meta) {
  const callback = this.async();

  setTimeout(() => {
    callback(null, content, map, meta);
  }, 1000)
}

// raw loader用法 接收到content是Buffer数据
// 用于处理图片和icon，可写同步和异步
module.exports = function (content) {
  return content;
}
module.exports.raw = true;


// pitch loader用法，处理多个数据时可以使用pitch
module.exports = function (content) {
  return content;
}
// 会先执行pitch方法。如果pitch有 return 将不再执行后面的loader
// webpack中执行 rules: [
//   {
//     test: /\.js$/,
//     test2中有return, test3不在执行, 会返回执行test1中的方法
//     use: ["./loaders/demo/test1", "./loaders/demo/test2", "./loaders/demo/test3"]
//   }
// ]
module.exports.pitch = function() {
  console.log("pitch")
}
