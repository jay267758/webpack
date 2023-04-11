###
开发环境
npm start

生产环境
npm run build

### 打断点
debugger

### debug 可以打印
"scripts": {
    "start": "npm run dev",
    "dev": "webpack serve --config ./config/webpack.dev.js",
    "build": "webpack --config ./config/webpack.prod.js",
    "debug": "node --inspect-brk ./node_modules/webpack-cli/bin/cli.js"
  },