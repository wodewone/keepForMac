## KEEP FOR MAC [![Build Status](https://travis-ci.org/wodewone/keepForMac.svg?branch=master)](https://travis-ci.org/wodewone/keepForMac)

![keep](keep-zilv.jpg)

## 介绍

Mac版keep应用（[最新体验版](https://pan.baidu.com/s/1geS7qVL)因为开发尚未结束，细节部分尚未完善，此版本仅为体验版本，如发现严重问题或有任何建议，可随时提出，欢迎大家反馈，谢谢！~）

使用 Electron + React 构建的桌面版 keep
> **注：**keep - 专注移动体育领域的应用开发，倡导开放共享的精神，不模仿，不跟风，只做酷的产品 荣获 App Store 2015年度精选（节选自 [keep 官网](http://www.gotokeep.com)）

## Preview

### NEW

![preview-10](http://wodewone.github.io/app/keep/preview/preview-10.jpg)

### BASE

![preview-1](http://wodewone.github.io/app/keep/preview/preview-1.jpg)
![preview-2](http://wodewone.github.io/app/keep/preview/preview-2.jpg)
![preview-3](http://wodewone.github.io/app/keep/preview/preview-3.jpg)
![preview-4](http://wodewone.github.io/app/keep/preview/preview-4.jpg)
![preview-5](http://wodewone.github.io/app/keep/preview/preview-5.jpg)
![preview-6](http://wodewone.github.io/app/keep/preview/preview-6.jpg)
![preview-7](http://wodewone.github.io/app/keep/preview/preview-7.jpg)
![preview-8](http://wodewone.github.io/app/keep/preview/preview-8.jpg)
![preview-9](http://wodewone.github.io/app/keep/preview/preview-9.jpg)

## 安装运行（Build Setup）
``` bash
# install dependencies
npm install

# serve with hot reload
npm run electron

# generate app
npm run dist
```


## Development

开发笔记：[开发进程以及过程中的问题](http://wodewone.github.io/2016/12/03/使用js创建macOS应用/)

技术栈：electron + webpack + babel + react + es6 + sass + cssModules

开发工具：IntelliJ IDEA 2016.2.5

其他工具：Charles（抓包工具）、Postman（接口测试工具）

开发平台：Mac

## 参考文献

* [开源electron App](https://github.com/sindresorhus/awesome-electron)
* [[译文] 通过 Electron 开发一个简单地桌面应用](https://gold.xitu.io/entry/56aae5e4a633bd0257ae4ab8)
* [Electron 快速入门](https://github.com/electron/electron/blob/master/docs-translations/zh-CN/tutorial/quick-start.md)
* [Electron API](http://electron.atom.io/docs/api/)
* [w3cschool Electron 中文 API](http://www.w3cschool.cn/electronmanual/electronmanual-tray.html)
* [Electron 文档](https://github.com/electron/electron/tree/master/docs-translations/zh-CN)
* [ES6转Node](http://taobaofed.org/blog/2016/01/07/find-back-the-lost-es6-features-in-nodejs/)
* [Node中没搞明白require和import，你会被坑的很惨](http://imweb.io/topic/582293894067ce9726778be9?utm_source=tuicool&utm_medium=referral)
* [使用 Electron 构建桌面应用](https://zhuanlan.zhihu.com/p/20225295)
* [React Native填坑之旅--HTTP请求篇](http://www.jianshu.com/p/4c61da559d75)
* [VueJs](http://cn.vuejs.org)
* [Electron+react+webpack 构造跨平台自动更新host应用](https://github.com/ppoffice/Hozz)
* [React 最佳实践——那些 React 没告诉你但很重要的事](https://segmentfault.com/a/1190000005013207)
* [阮一峰React项目脚手架](http://www.ruanyifeng.com/blog/2016/09/react-technology-stack.html)
* [CSSModules详解及React中实践](https://github.com/camsong/blog/issues/5)
* [谈谈 CSS Modules](http://boke.io/tan-tan-css-modules/)
* [html-webpack-plugin详解](http://www.cnblogs.com/wonyun/p/6030090.html)
* [[译] Webpack——令人困惑的地方](https://segmentfault.com/a/1190000005089993?utm_source=tuicool&utm_medium=referral)
* [[译] react-css-modules](https://segmentfault.com/a/1190000004530909)
* [使用 webpack + react + redux + es6 开发组件化前端项目](https://segmentfault.com/a/1190000005969488)
* [React/React Native 的ES5 ES6写法对照表](http://bbs.reactnative.cn/topic/15/react-react-native-%E7%9A%84es5-es6%E5%86%99%E6%B3%95%E5%AF%B9%E7%85%A7%E8%A1%A8)
* [使用 react-hot-loader](https://segmentfault.com/a/1190000004660311)
* [React doesn't switch to production mode](http://stackoverflow.com/questions/37311972/react-doesnt-switch-to-production-mode)
* [react组件间通信](http://www.alloyteam.com/2015/07/react-zu-jian-jian-tong-xin/#prettyPhoto)
* [github/fetch](https://github.com/github/fetch)
* [在 JS 中使用 fetch 更加高效地进行网络请求](http://blog.parryqiu.com/2016/03/02/using_fetch_in_nodejs/)
* [JWT 认证模式简单描述](http://solee.me/2016/02/01/jwt-ren-zheng-mo-shi-jian-dan-miao-shu/#open)
* [Bearer Token](http://www.haomou.net/2014/08/13/2014_bare_token/)
* [深入理解 react-router 路由系统](https://zhuanlan.zhihu.com/p/20381597?columnSlug=purerender)
* [webpack中关于样式的处理](https://github.com/zhengweikeng/blog/issues/9)
* [使用 ES2015 重构 React 组件
  ](https://csspod.com/refactoring-react-components-to-es2015-classes/)
* [webpack多页应用架构系列（六）：听说webpack连图片和字体也能打包？](https://segmentfault.com/a/1190000006907701)
* [加速electron在国内的下载速度](http://blog.tomyail.com/install-electron-slow-in-china/)
* [深入Electron ](https://github.com/zjzhome/I_want_to_say/issues/3)
* [用Electron开发桌面应用](http://get.ftqq.com/7870.get#)
* [用 Electron 打造跨平台前端 App](http://web.jobbole.com/86509/)

