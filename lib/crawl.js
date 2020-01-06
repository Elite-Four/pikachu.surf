const debug = require('debug')('pikachu.surf')
const FeedCralwer = require('./crawlers/FeedCrawler')
const Post = require('./Post')
const Writer = require('./Writer')

const crawlers = [
  new FeedCralwer('https://52poke.com/feed/'),
  new FeedCralwer('https://pokemondb.net/news/feed'),
  new FeedCralwer('https://bulbanews.bulbagarden.net/feed/news.rss')
]

const crawl = module.exports = async function crawl () {
  for (const crawler of crawlers) {
    try {
      debug('Crawling %s', crawler.toString())

      for await (const post of crawler.crawl()) {
        if (await post.exists()) {
          debug('Post %s is exists', post.valueOf())
          break
        }

        const writer = new Writer(post)
        debug('Writing %s to %s', post.valueOf(), post.root)
        await writer.write()
        debug('Screenshooting %s to %s', post.valueOf(), post.root)
        await writer.screenshot()
      }

      debug('Crawled %s', crawler.toString())
    } catch (error) {
      debug('Failed to crawl %s', crawler.toString(), error.stack)
    }
  }

  debug('Generating posts')

  const posts = []
  for await (const post of Post.list()) {
    posts.push(post)
  }
  posts.sort(({ date: dateA }, { date: dateB }) => dateA.valueOf() - dateB.valueOf())
  posts.reverse()
  posts.splice(10)
  await Writer.write(posts)

  debug('Generated posts')

  process.exit(0)
}

if (require.main === module) {
  crawl()
}
