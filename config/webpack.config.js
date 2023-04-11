const path = require("path") // node.js核心模块，处理路径问题
const os = require("os");
const ESLintPlugin = require('eslint-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // 单独打包css文件，解决闪屏现象
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

const threads = os.cpus().length; // 获取cpu数
// 获取环境变量
const isProduction = process.env.NODE_ENV === "production"
console.log(process.env.NODE_ENV)
function styleLoader(pre) {
  return  [
    //  执行顺序，从右到左，从下到上
    isProduction ? "style-loader" : MiniCssExtractPlugin.loader,
    'css-loader', // 将css资源编译成commonjs的模块到js中
    {
      loader: "postcss-loader",
      options: {
        postcssOptions: {
          plugins: [
            "postcss-preset-env", // 解决样式兼容性问题
          ]
        }
      }
    },
    pre
  ].filter(Boolean)
}

module.exports = {
  // 入口文件
  entry: "./src/main.js",
  // 输出文件
  output: {
    // 文件输出路径
    path: isProduction ? path.resolve(__dirname, '../dist') : undefined ,
    filename: "js/main.js", // 指定输出路径
    clean: true // 自动清掉上一次打包文件
  },
  // 加载器
  module: {
    rules: [
      {
        // 当规则匹配时，只使用第一个匹配规则。
        oneOf: [
          // loader 配置
          {
            test: /\.css$/,
            use: styleLoader()
          }, // 只检测 .css 文件
          {
            test: /\.ts$/,
            use: 'ts-loader'
          },
          {
            test: /\.less$/, // 使用什么就配置什么
            use: styleLoader('less-loader')
          },
          // {
          //   test: /\.s[ac]ss$/, // 支持sass/scss 
          //   use:  styleLoader('sass-loader')
          // }
          { // 处理图片
            test: /\.(png|jpe?g|gif|webp|svg)$/, // 
            type: 'asset',
            parser: {
              dataUrlCondition: {
                maxSize: 10 * 1024 // 4kb
              }
            },
            generator: {
              // 输出图片路径
              // [hash:10] hash 值取10位
              filename: "static/image/[hash:10][ext][query]"
            }
          },
          { // 处理icon和其他资源，如视频，音频
            test: /\.(ttf|woff2?|map3|map4|avi)$/,
            type: "asset/resource", // 原封不动输出
            generator: {
              filename: "static/media/[hash:10][ext][query]"
            }
          },
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: [
              {
                // 开启多线程打包
                loader: "thread-loader",
                options: {
                  worker: threads
                }
              },
              {
                loader: "babel-loader",
                options: {
                  cacheDirectory: true, // 开启babel缓存
                  cacheCompression: false, // 关闭缓存文件压缩
                  plugins: ["@babel/plugin-transform-runtime"] // 减少代码体积
                }
              }
            ]
          }
        ]
      }
    ]
  },
  // 插件
  plugins: [
    new ESLintPlugin({
      // 只检查src目录下的文件
      context: path.resolve(__dirname, "../src"),
      cache: true, // 开启缓存
      threads, // 开启多线程
    }),
    new HtmlWebpackPlugin({
      // 模板： 已pulic/index.html文件创建新的html文件
      // 特点：结构和原来一样，自动引入打包输出资源
      template:  path.resolve(__dirname, "../public/index.html")
    }),
    !isProduction && new MiniCssExtractPlugin({
      filename: "static/css/main.css"
    }),
  ].filter(Boolean),
  optimization: {
    minimize: isProduction,
    minimizer: [
      new CssMinimizerPlugin(), // 压缩css文件
      new TerserWebpackPlugin({ // 压缩js文件
        parallel: threads,
      }),
      new ImageMinimizerPlugin({  // 压缩图片
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminGenerate,
          options: {
            plugins: [
              ["gifsicle", { interlaced: true }],
              ["jpegtran", { progressive: true }],
              ["optipng", { optimizationLevel: 5 }],
              [
                "svgo",
                {
                  plugins: [
                    "preset-default",
                    "prefixIds",
                    {
                      name: "sortAttrs",
                      params: {
                        attributes: "alphabetical",
                      },
                    },
                  ],
                },
              ],
            ],
          }
        },
      }),
    ],
    // 代码分割配置
    splitChunks: {
      chunks: 'all',
      // minSize: 20000,
      // minRemainingSize: 0,
      // minChunks: 1,
      // maxAsyncRequests: 30,
      // maxInitialRequests: 30,
      // enforceSizeThreshold: 50000,
      // cacheGroups: {
      //   defaultVendors: {
      //     test: /[\\/]node_modules[\\/]/,
      //     priority: -10,
      //     reuseExistingChunk: true,
      //   },
      //   default: {
      //     minChunks: 2,
      //     priority: -20,
      //     reuseExistingChunk: true,
      //   },
      // },
    },
  },
  // 开启服务器(热更新)
  devServer: {
    host: "localhost", // 启动服务器域名
    port: "3000", // 启动服务器端口号
    open: true // 是否自动开启服务器
  },
  // 开发模式配置 development(开发模式)  production(生产模式)
  mode: isProduction ? "production" : "development",
  // 用于映射打包后对应打包前的代码。主要用于提示错误信息
  devtool: isProduction ? "source-map" : "cheap-module-source-map" // 提示横位置信息
}