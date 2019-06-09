# copyright-webapck-plugin
### 什么是plugin？

在 Webpack 运行的生命周期中会广播出许多事件，Plugin 可以监听这些事件，在合适的时机通过 Webpack 提供的 API 改变输出结果。

### plugin和loader的区别是什么？

对于loader，它就是一个转换器，将A文件进行编译形成B文件，这里操作的是文件，比如将A.scss或A.less转变为B.css，单纯的文件转换过程

plugin是一个扩展器，它丰富了wepack本身，针对是loader结束后，webpack打包的整个过程，它并不直接操作文件，而是基于事件机制工作，会监听webpack打包过程中的某些节点，执行广泛的任务。


### 一个最简单的插件
./plugins/copyright-webpack-plugin.js

```
class CopyrightWebpackPlugin {

	apply(compiler) { // compiler存放所有配置和打包的内容
 //一个新的编译(compilation)创建之后
		compiler.hooks.compile.tap('CopyrightWebpackPlugin', (compilation) => { // 同步
			console.log('compiler');
		})
// 生成资源到 output 目录之前。 增加一个txt文件
		compiler.hooks.emit.tapAsync('CopyrightWebpackPlugin', (compilation, cb) => {
			debugger;
			compilation.assets['copyright.txt']= { // compilation里存放和这次打包有关的内容
				source: function() {
					return 'copyright by dell lee'
				},
				size: function() {
					return 21; // 文件有多长 21字符长度
				}
			};
			cb();  // tapAsync一定要在最后调用
		})
	}

}

module.exports = CopyrightWebpackPlugin;
```


webpack配置

```
const path = require('path');
const CopyRightWebpackPlugin = require('./plugins/copyright-webpack-plugin');

module.exports = {
	mode: 'development',
	entry: {
		main: './src/index.js'
	},
	plugins: [
		new CopyRightWebpackPlugin()
	],
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].js'
	}
}
```

webpack 启动后，在读取配置的过程中会先执行 new CopyrightWebpackPlugin(options) 初始化一个 CopyrightWebpackPlugin 获得其实例。

在初始化 compiler 对象后，再调用 copyrightWebpackPlugin.apply(compiler) 给插件实例传入 compiler 对象。

插件实例在获取到 compiler 对象后，就可以通过 compiler.plugin(事件名称, 回调函数) 监听到 Webpack 广播出来的事件。

并且可以通过 compiler 对象去操作 webpack。


看到这里可能会问compiler是啥，compilation又是啥？

Compiler 对象包含了 Webpack 环境所有的的配置信息，包含 options，loaders，plugins 这些信息，这个对象在 Webpack 启动时候被实例化，它是全局唯一的，可以简单地把它理解为 Webpack 实例；

Compilation 对象包含了当前的模块资源、编译生成资源、变化的文件等。当 Webpack 以开发模式运行时，每当检测到一个文件变化，一次新的 Compilation 将被创建。Compilation 对象也提供了很多事件回调供插件做扩展。通过 Compilation 也能读取到 Compiler 对象。
        
Compiler 和 Compilation 的区别在于：

Compiler 代表了整个 Webpack 从启动到关闭的生命周期，而 Compilation 只是代表了一次新的编译。

### 事件流

webpack 通过 Tapable 来组织这条复杂的生产线。

webpack 的事件流机制保证了插件的有序性，使得整个系统扩展性很好。

webpack 的事件流机制应用了观察者模式，和 Node.js 中的 EventEmitter 非常相似。


绑定事件
```
compiler.plugin('event-name', params => {

 ...    

});
```

触发事件

``` compiler.apply('event-name',params) ```

只要能拿到 Compiler 或 Compilation 对象，就能广播出新的事件，所以在新开发的插件中也能广播出事件，给其它插件监听使用。
 
传给每个插件的 Compiler 和 Compilation 对象都是同一个引用。也就是说在一个插件中修改了 Compiler 或 Compilation 对象上的属性，会影响到后面的插件。

有些事件是异步的，这些异步的事件会附带两个参数，第二个参数为回调函数，在插件处理完任务时需要调用回调函数通知 webpack，才会进入下一处理流程 。例如：


```
compiler.plugin('emit',function(compilation, callback) {

```


```   

 // 处理完毕后执行 callback 以通知 Webpack

 // 如果不执行 callback，运行流程将会一直卡在这不往下执行

 callback();

});

```
(更多）[https://blog.csdn.net/qq_34629352/article/details/83628917]
