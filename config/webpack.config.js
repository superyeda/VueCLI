const EslintWebPackPlugin = require("eslint-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin=require("mini-css-extract-plugin")
const CssMinimizerWebpackPlugin=require("css-minimizer-webpack-plugin")
const TerserWebpackPlugin=require("terser-webpack-plugin")
const CopyPlugin=require("copy-webpack-plugin")
const { VueLoaderPlugin } = require("vue-loader")
const {DefinePlugin} =require("webpack")

// const ImageMinimizerPlugin=require("image-minimizer-plugin")//图片压缩

const IsProduction=process.env.NODE_ENV==="production"

const path = require("path")
const getStyleLoader = (pre) => {
    return [
        IsProduction?MiniCssExtractPlugin.loader:'vue-style-loader',
        "css-loader",
        // 处理css兼容性问题，还需在broswerlist来指定兼容
        {
            loader: 'postcss-loader',
            options: {
                postcssOptions: {
                    plugins: ["postcss-preset-env"]
                }
            }
        },
        pre
    ].filter(Boolean)
}

module.exports = {
    entry: "./src/main.js",
    output: {
        path: IsProduction?path.resolve(__dirname,"../dist"):undefined,
        filename: IsProduction?"static/js/[name].[contenthash:10].js":"static/js/[name].js",
        chunkFilename:IsProduction?"static/js/[name].[contenthash:10].chunk.js":"static/js/[name].chunk.js",
        assetModuleFilename: "static/media/[hash:10][ext][query]",
    },
    module: {
        rules: [
            // 处理样式
            {
                test: /\.css$/,
                use: getStyleLoader()
            },
            {
                test: /\.less$/,
                use: getStyleLoader("less-loader")
            },
            {
                test: /\.s[ac]ss$/,
                use: getStyleLoader("sass-loader")
            },
            {
                test: /\.styl$/,
                use: getStyleLoader('stylus-loader')
            },
            // 处理图片
            {
                test: /\.(jpe?g|png|gif|webp|svg)/,
                type: "asset",
                parser: { //10kb以下直接转base64
                    dataUrlCondition: {
                        maxSize: 10 * 1024
                    }
                }
            },
            // 处理其他资源
            {
                test: /\.(woff2|ttf|mp4)$/,
                type: "asset/resource"
            },
            // 处理js
            {
                test: /\.js/,
                include: path.resolve(__dirname, "../src"),
                loader: "babel-loader",
                options: {
                    cacheDirectory: true,
                    cacheCompression: false,
                }
            },
            {
                test:/\.vue$/,
                loader:"vue-loader",
                options:{
                    // 开启缓存第二次打包更快
                    cacheDirectory:path.resolve(__dirname,'../node_modules/.cache/vue-loader')
                }
            }
        ]
    },
    plugins: [
        new EslintWebPackPlugin({
            context: path.resolve(__dirname, "../src"),
            exclude: 'node_modules',
            cache: true,
            cacheLocation: path.resolve(__dirname, "../node_modules/.cache/.eslintcache")
        }),
        // 处理html
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "../public/index.html")
        }),
        // css单独提取
        IsProduction && new MiniCssExtractPlugin({
            filename:"static/css/[name].[contenthash:10].css",
            chunkFilename:"static/css/[name].[contenthash:10].chunk.css"
        }),
        // 复制公共资源
        IsProduction && new CopyPlugin({
            patterns:[
                {
                    from:path.resolve(__dirname,"../public"),
                    to:path.resolve(__dirname,"../dist"),
                    globOptions:{
                        ignore:["**/index.html"]
                    }
                }
            ]
        }),
        new VueLoaderPlugin(),
        new DefinePlugin({
            __VUE_OPTIONS_API__:true,
            __VUE_PROD_DEVTOOLS__:false
        })
    ].filter(Boolean),
    mode: IsProduction?"production":"development",
    devtool: IsProduction?"source-map":"cheap-module-source-map",
    // 代码分割
    optimization: {
        splitChunks: {
            chunks: "all",
            // 分类打包
            cacheGroup:{
                vue:{
                    test:/[\\/]node_modules[\\/]vue(.*)?[\\/]/,
                    name:"vue-chunk",
                    priority:40
                },
                libs:{
                    test:/[\\/]node_modules[\\/]/,
                    name:"libs-chunk",
                    priority:30
                }
            }
        },
        // 对应文件
        runtimeChunk: {
            name: entrypoint => `runtime~${entrypoint.name}.js`
        },
        minimize:IsProduction,
        minimizer:[
            new CssMinimizerWebpackPlugin(),//优化压缩css代码
            new TerserWebpackPlugin(),      //压缩js代码
            
        ]
    },
    resolve: {
        //webpack解析加载模块
        // 自动补全文件拓展名
        extensions:[".vue",".js",".json"],
        alias:{
            "@":path.resolve(__dirname,"../src")
        }

    },
    devServer: {
        host: "localhost",
        port: 3000,
        open: true,
        hot: true,
        historyApiFallback:true //解决前端刷新404问题
    },
    performance:false
}