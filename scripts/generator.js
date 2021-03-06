const nunjucks = require('nunjucks')
const path = require('path')
const fs = require('fs')

const env = new nunjucks.configure({ autoescape: false })
env.addFilter('noControlChars', function(str) {
	return str && str.replace(/[\x00-\x1F\x7F]/g, '')
})

const searchTmplSrc = path.join(__dirname, '../templates/articles.xml')

hexo.extend.generator.register('xml', function(locals){
  const searchTmpl = nunjucks.compile(fs.readFileSync(searchTmplSrc, 'utf8'), env)
  const posts = locals.posts.sort('-date').toArray().slice(0, 10)
  const xmlData = searchTmpl.render({
    posts,
    root: this.config.root
  })
  return {
    path: 'articles.xml',
    data: xmlData
  }
})