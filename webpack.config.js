var webpack = require('webpack');
var path = require('path');

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

//var precss = require('precss');
//var autoprefixer = require('autoprefixer');

require('url-loader')

module.exports = {
    entry: {
        app: [
            'webpack-dev-server/client?http://localhost:3000',
            'webpack/hot/only-dev-server',
            //'webpack/hot/dev-server',
            './src/main.js'
        ],
        lib: [
            'react', 'react-dom', 'react-router', 'react-css-modules'
        ],
        appExercise: './src/js/ModuleExercise.js'

    },
	output: {
        path: path.join(__dirname, './app'),
        //publicPath: 'http://localhost:3000',
        publicPath: '',
        filename: '[name].js',
        chunkFilename: '[name].js'
        //hotUpdateChunkFilename: '/hot/hot-update.js',
        //hotUpdateMainFilename: '/hot/hot-update.json'
    },
	module: {
		loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'react-hot-loader/webpack!babel',   // react-hot-loader v3.0
                //loader: 'babel',
            },
            {
				test: /\.(scss|css)$/,
				//loader: ExtractTextPlugin.extract('style', 'css!sass?modules&importLoaders=1&localIdentName=[hash:base64:5]&resolve-url')
                loaders: [
                    'style',
                    'css?modules&importLoaders=1&localIdentName=[hash:base64:5]&resolve-url',  // resolve-url-loader 这个必须引入不然出错
                    'sass'
                    ]
            },
            {
                test: /\.(png|jpg)$/,
                loader: 'url?limit=2048&name=/images/[hash:8].[name].[ext]'
            },
            {
                // 专供iconfont方案使用的，后面会带一串时间戳，需要特别匹配到
                test: /\.(woff|woff2|svg|eot|ttf)\??.*$/,
                loader: 'file?name=/fonts/[name].[ext]',
            },
            {
                test: /\.mp3$/,
                loader: 'file?name=/sounds/[name].[ext]',
            }
		]
    },
    devServer: {
        contentBase: "./app",	    //本地服务器所加载的页面所在的目录
        colors: true,				//终端中输出结果为彩色
        historyApiFallback: true,	//不跳转
        inline: true,				//实时刷新
        compress: true,
    },
    // 使用 postcss 为 css 自动添加前缀~ 很好很强大，可惜我这里用不到
    //postcss: function() {
    //    return [precss, autoprefixer];
    //},
    plugins: [
        // 开启独立 css 到单独文件
        new ExtractTextPlugin('app.css', {
            allChunks: true
        }),

        // 自动生成 html 并引入相应文件
        new HtmlWebpackPlugin({
            title: 'keep for mac',
            filename: 'index.html',
            chunks: [
                'app',
                'lib'
            ],
        }),
        new HtmlWebpackPlugin({
            title: '',
            filename: 'startExercise.html',
            chunks: [
                'appExercise',
                'lib'
            ],
        }),

        // 使用 Code Splitting 将应用依赖文件单独打包
        new webpack.optimize.CommonsChunkPlugin('lib', 'js/lib.js'),

        // 压缩并打包文件
        //new webpack.optimize.UglifyJsPlugin({
        //    compress: {
        //        warnings: false
        //    }
        //}),

        // react 热部署
        new webpack.HotModuleReplacementPlugin(),

        // 解决开发时提示React没有切换到产品版本
        // [React doesn't switch to production mode](http://stackoverflow.com/questions/37311972/react-doesnt-switch-to-production-mode)
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV),
            }
        })
    ],
    target: 'electron-renderer'
};