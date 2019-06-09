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