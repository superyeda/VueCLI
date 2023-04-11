const EslintWebPackPlugin = require("eslint-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin=require("mini-css-extract-plugin")
const CssMinimizerWebpackPlugin=require("css-minimizer-webpack-plugin")
const TerserWebpackPlugin=require("terser-webpack-plugin")
const CopyPlugin=require("copy-webpack-plugin")
const { VueLoaderPlugin } = require("vue-loader")
const {DefinePlugin} =require("webpack")

// const ImageMinimizerPlugin=require("image-minimizer-plugin")//图片压缩



const path = require("path")
const getStyleLoader = (pre) => {
    return [
        MiniCssExtractPlugin.loader,
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
        path: path.resolve(__dirname,"../dist"),
        filename: "static/js/[name].[contenthash:10].js",
        chunkFilename: "static/js/[name].[contenthash:10].chunk.js",
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
                loader:"vue-loader"
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
        new MiniCssExtractPlugin({
            filename:"static/css/[name].[contenthash:10].css",
            chunkFilename:"static/css/[name].[contenthash:10].chunk.css"
        }),
        // 复制公共资源
        new CopyPlugin({
            patterns:[
                {
                    from:path.resolve(__dirname,"../public"),
                    to:path.resolve(__dirname,"../dist"),
                    globOptions:{
                        ignore:["**/index.html"]
                    }
                }
            ]
        })
    ],
    mode: "production",
    devtool: "source-map",
    // 代码分割
    optimization: {
        splitChunks: {
            chunks: "all",
        },
        // 对应文件
        runtimeChunk: {
            name: entrypoint => `runtime~${entrypoint.name}.js`
        },
        minimizer:[
            new CssMinimizerWebpackPlugin(),//优化压缩css代码
            new TerserWebpackPlugin(),      //压缩js代码
            new VueLoaderPlugin(),
            new DefinePlugin({
                __VUE_OPTIONS_API__:true,
                __VUE_PROD_DEVTOOLS__:false
            })
        ]
    },
    resolve: {
        //webpack解析加载模块
        // 自动补全文件拓展名
        extensions:[".vue",".js",".json"]

    }
}