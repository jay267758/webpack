const loaderUtils =  require("loader-utils"); // 用于生成文件名

module.exports = function (content) {
  // 根据文件内容生成hash值文化名
  let interpolatedName = loaderUtils.interpolateName(
    this,
    "[hash].[ext][query]",
    {
      content
    }
  );
  interpolatedName = `images/${interpolatedName}`
  // 将文件输出出去
  this.emitFile(interpolatedName, content);
  // 返回 module-exports
  return `module-exports = "${interpolatedName}"`
}
//  处理图片、字体等文件。它们都是buffer数据
//  需要使用raw loader才能处理
module.exports.raw = true

// webpack中执行
// {
//   test: /\.(png|jpe?g|gif)$/,
//   loader: "./loaders/file-loader",
//   type: "javascript/auto" // 阻止webpack默认处理图片资源，只用自定义的file-loader处理
// }