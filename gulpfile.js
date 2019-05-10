const gulp = require('gulp'),
  htmlmin = require('gulp-htmlmin'),   //html压缩组件
  htmlclean = require('gulp-htmlclean'), //html清理组件
  plumber = require('gulp-plumber'),  //容错组件（发生错误不跳出任务，并报出错误内容）
  Hexo = require('hexo')

const hexo = new Hexo(process.cwd(), {})

// 创建静态页面 （等同 hexo generate）
gulp.task('generate', async function() {
  try {
    await hexo.init()
    await hexo.call('clean')
    await hexo.call('generate', { watch: false })
    return hexo.exit()
  }
  catch (err) {
    return hexo.exit(err)
  }
})

// 压缩public目录下的html文件
gulp.task('compressHtml', () => {
  const cleanOptions = {
    protect: /<\!--%fooTemplate\b.*?%-->/g,             //忽略处理
    unprotect: /<script [^>]*\btype="text\/x-handlebars-template"[\s\S]+?<\/script>/ig //特殊处理
  }
  const minOption = {
    collapseWhitespace: true,           //压缩HTML
    collapseBooleanAttributes: true,    //省略布尔属性的值  <input checked="true"/> ==> <input />
    removeEmptyAttributes: true,        //删除所有空属性值    <input id="" /> ==> <input />
    removeScriptTypeAttributes: true,   //删除<script>的type="text/javascript"
    removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
    removeComments: true,               //清除HTML注释
    minifyJS: true,                     //压缩页面JS
    minifyCSS: true,                    //压缩页面CSS
    minifyURLs: true                    //替换页面URL
  }
  return gulp.src('./public/**/*.html')
    .pipe(plumber())
    .pipe(htmlclean(cleanOptions))
    .pipe(htmlmin(minOption))
    .pipe(gulp.dest('./public'))
})

// 同步图片到对象存储仓库
gulp.task('syncImages', () => {
  // 程序执行的传参
  var argv = require('optimist')
    .usage('$0 --accessKey [string] --accessSecret [string]')
    .demand(['accessKey', 'accessSecret'])
    .argv
  
  const listImages = require('./image_sync/list_images')
  // 当前本地存在的所有图片
  const imagesList = listImages(`${process.cwd()}/source/`, 'images/')
  const ImageSynchronizer = require('./image_sync/image_synchronize')
  const nosSetting = {
    defaultBucket: 'blog-cdn',
    endpoint: 'http://nos-eastchina1.126.net',
    accessKey: argv.accessKey,
    accessSecret: argv.accessSecret
  }
  const imageSynchronizer = new ImageSynchronizer(nosSetting, imagesList, `${process.cwd()}/source/`)
  return imageSynchronizer.synchronize('images/')
})

// 默认任务
gulp.task('default', 
	gulp.series('generate', 'compressHtml', 'syncImages') // 串行执行任务
)