class CleanWebpackPlugin { // 删除之前打包的文件
  apply(compiler) {
    // 获取打包输出目录
    const outputPath = compiler.options.output.path;
    const fs = compiler.outputFileSystem;
    // 注册 emit 钩子
    compiler.hooks.emit.tap("CleanWebpackPlugin", () => {
      // 通过 fs 删除打包输出的目录下的所有文件
      this.removeFiles(fs, outputPath);
    });
  }

  removeFiles(fs, filepath) {
    // 读取当前目录下所有资源
    const files = fs.readdirSync(filepath)
    files.forEach((file) => {
      const path = `${filepath}/${file}`;
      const fileStat = fs.statSync(path);

      if (fileStat.isDirectory()) { // 判断是否是文件夹
        // 文件夹 递归
        this.removeFiles(fs, path)
      } else {
        // 是文件， 直接删
        fs.unlinkSync(path);
      }
    })
  }
}

module.exports = CleanWebpackPlugin;

// webpack 引入自定义 plugin 
// const CleanWebpackPlugin = require('./plugins/clean-plugin.js')
// 在 plugins 中调用
// new CleanWebpackPlugin ()