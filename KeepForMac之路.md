## 序

> 我很喜欢keep这个应用，也很喜欢使用它；但是自己不大喜欢喜欢用手机，所以当在手机上看到有些应用只能在手机上使用时觉得好别扭，但我本身也不是写移动App的，只是会写点 js，都说js啥都能干，那我就用它干！


## 关于 Keep

> "Keep 是一个热爱运动的年轻团队，同时也是一群追求极致体验的 Geek。我们专注移动体育领域的应用开发，倡导开放共享的精神，不模仿，不跟风，只做酷的产品。
> 在我们生活的这个年代里，健身运动文化正在觉醒，应该有更专业的工具，更纯粹的社区，让好身材来得更容易些。这就是 Keep 正在做的事情，我们希望通过科技驱动，让更多的人热爱健身，喜欢运动。"
> [以上内容节选自keep官网](http://www.gotokeep.com)

![preview-1](http://wodewone.github.io/app/keep/keep-zilv.jpg)

然而我只是一个喜欢运动的程序员，但是我比较懒~
所以身材嘛~就不告诉你们！ 哈哈~~~

## 技术栈

> 悄悄的留下Github地址 
> // [https://github.com/wodewone/keepForMac](https://github.com/wodewone/keepForMac) 
> 喜欢的朋友请点个start~ 谢谢！

技术栈 **electron + webpack + babel + react + es6 + sass + cssModules**

#### Electron

> The Electron framework lets you write cross-platform desktop applications using JavaScript, HTML and CSS. It is based on Node.js and Chromium and is used by the Atom editor and many other apps.
> [节选自electron 官网](http://electron.atom.io/)

> 使用 electron 创建的最典型的应用 Atom

[![Atom](http://electron.atom.io/images/apps/atom-icon.png)](https://atom.io/)

[更多应用请点击查看](http://electron.atom.io/apps/)

## main

### 运行效果图

![preview-10](http://wodewone.github.io/app/keep/preview/preview-10.jpg)

### 下载体验
> [最新体验版本泄露](https://pan.baidu.com/s/1geS7qVL)由于目前功能还没有达到我理想中的可用版本，所以暂时为测试版，如发现有严重问题欢迎来 push issues

> 关于项目进度以及在开发中遇到的问题我会在[**我的博客**](http://wodewone.github.io/2016/12/03/%E4%BD%BF%E7%94%A8js%E5%88%9B%E5%BB%BAmacOS%E5%BA%94%E7%94%A8/)内持续更新，也欢迎大家留言！~

### 项目结构

结构图

```mermaid
.
├── ./Doc-api-keep.md		# 已知api接口
├── ./app						# webapck 编译打包压缩生成的文件
├── ./build					# electron-builder生成安装包配置目录
│   ├── ./build/background.png   # (macOS DMG background)
│   ├── ./build/icon.icns        # (macOS app icon)
│   └── ./build/icon.ico         # (Windows app icon)
├── ./dev-server.js
├── ./json					# 部分Api接口数据
├── ./main.js					# electron 初始化文件
├── ./package.json
├── ./preview					# 项目运行预览图
├── ./src
│   ├── ./src/assets		# 静态资源文件
│   ├── ./src/components	# 项目组件文件
│   ├── ./src/js				# 主模块文件
│   ├── ./src/main.js		# render 进程入口文件
│   └── ./src/sass			# 样式文件
└── ./webpack.config.js		# webpack 配置文件
```

> 提供两个在线将`png`转`icns`的工具地址
> [easyicon](http://www.easyicon.net/covert/)
> [iconverticons](https://iconverticons.com/online/)

### Main process

> `electron` 分为两个进程去管理一个是**主进程**由`Node`提供服务，负责和系统进行操作与GUI亲密接触，一个是**渲染进程**也就是我们平常写的web页面。但是`electron`提供了一系列接口可以让你在两个进程间随时通信（详细内容请渲染进程[可用模块](https://github.com/electron/electron/tree/master/docs-translations/zh-CN#在渲染进程网页内可用的模块)）
> 这里我只简单的介绍下，有兴趣的同学可以参考下这两片文章，入门很不错！
> 1. [使用 Electron 构建桌面应用](https://zhuanlan.zhihu.com/p/20225295)
> 2. [[译文] 通过 Electron 开发一个简单地桌面应用](https://gold.xitu.io/entry/56aae5e4a633bd0257ae4ab8)
> 另外官网还有很多 [优秀的App](http://electron.atom.io/apps/)
> 然后 [这里](https://github.com/sindresorhus/awesome-electron) 也收集了很多不错的示例，都是在`Github`上开源的，大家可以下载体验
> 最后这个是[官方文档](http://electron.atom.io/docs/)，以及[中文文档](https://github.com/electron/electron/tree/master/docs-translations/zh-CN)


这个是我的主进程代码
./main.js

```javascript
const {app, BrowserWindow} = require('electron')
const path = require('path')

let keep

const createWindow = () =>{
    keep = new BrowserWindow({
        'width': 999,
        'minWidth': 999,
        'height': 666,
        'minHeight': 666,
        //'resizable': false,
        'title': 'Keep',
        'center': true,
        'titleBarStyle': 'hidden',
        'zoomToPageWidth': true,
        'frame': false,
        'show': false
    })

    keep.loadURL(`file://${__dirname}/app/index.html`)

    //keep.webContents.openDevTools()
    keep.webContents.on( 'did-finish-load', function () {
        keep.show();
    })

    keep.on('close', (e) => {
        keep = null
    })

};

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate',() => {
    if (app == null)
        createWindow()
    app.show()
})
```

### Render process

> **渲染进程**

./src/main.js 部分代码
react 路由配置
```javascript
ReactDOM.render(
    <Router history={hashHistory}>
        <Route path='/' onEnter={RequireAuth} component={App}>
            <IndexRoute component={AppTraining}></IndexRoute>
            <Route path='training' component={AppTraining}></Route>
                <Route path='plan/:plan_id' component={AppWorkout}>
                    <Route path=':desc_id' component={WorkoutDescription}></Route>
                </Route>

            <Route path='explore' component={AppExplore}></Route>
            <Route path='record' component={AppRecord}></Route>
            <Route path='user-center' component={AppUserCenter}></Route>
        </Route>
        <Route path='/login' component={AppLogin}></Route>
    </Router>,
    document.getElementById('app')
)
```

## 鉴赏图

欢迎大家评鉴

![preview-1](http://wodewone.github.io/app/keep/preview/preview-1.jpg)
![preview-2](http://wodewone.github.io/app/keep/preview/preview-2.jpg)
![preview-3](http://wodewone.github.io/app/keep/preview/preview-3.jpg)
![preview-4](http://wodewone.github.io/app/keep/preview/preview-4.jpg)
![preview-5](http://wodewone.github.io/app/keep/preview/preview-5.jpg)
![preview-6](http://wodewone.github.io/app/keep/preview/preview-6.jpg)
![preview-7](http://wodewone.github.io/app/keep/preview/preview-7.jpg)
![preview-8](http://wodewone.github.io/app/keep/preview/preview-8.jpg)
![preview-9](http://wodewone.github.io/app/keep/preview/preview-9.jpg)

## 后续

> 因为当前版本还没有完全的可以使用，只是完成了部分功能(虽然完成了核心的功能但是尚有不足，有兴趣的可以关注我的[博客](http://wodewone.github.io/)，Github将持续为您导航~)
