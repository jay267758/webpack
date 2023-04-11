const path = require("path") // node.js核心模块，处理路径问题
const os = require("os");
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // 单独打包css文件，解决闪屏现象
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

const threads = os.cpus().length;

console.log(process.env.NODE_ENV)

function styleLoader(pre) {
  return [
    //  执行顺序，从右到左，从下到上
    // MiniCssExtractPlugin.loader,
    'style-loader',
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
    path: path.resolve(__dirname, '../dist'),
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
                // 开启多线程
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
    // new MiniCssExtractPlugin({
    //   filename: "static/css/main.css"
    // }),
    // 压缩图片
    new ImageMinimizerPlugin({
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
  optimization: {
    minimizer: [
      new CssMinimizerPlugin(), // 压缩css文件
      new TerserWebpackPlugin({ // 压缩js文件
        parallel: threads,
      })
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
  // 开发模式配置 development(开发模式)  production(生产模式)
  mode: "production",
  // 用于映射打包后对应打包前的代码。主要用于提示错误信息
  devtool: "source-map" // 提示纵横位置信息
}