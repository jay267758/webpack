// 自定义 banner-loader 添加注释代码开发者
// schema规则中的 additionalProoerties 表示不允许添加新属性
const schema = require("./json/banner-schema.json")

module.exports = function (content) {
  // schema 定义规则
  const options = this.getOptions(schema)

  const prefix = `
    /*
    * Author: ${options.author}
    */
  `

  return prefix + content
}

// webpack中运用 
// {
//   test: /\.js$/,
//   loader: "./loaders/banner-loader.js",
//   options: {
//     author: '陈吉'
//   }
// }