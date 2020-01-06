const Post = require('../Post')

const axios = require('axios').default
const { parseFeed } = require('htmlparser2')

class FeedCrawler {
  /**
   * @param {string} url
   */
  constructor (url) {
    this.url = url
  }

  toString () {
    return `[FeedCrawler ${this.url}]`
  }

  async * crawl () {
    const response = await axios.get(this.url, { responseType: 'text' })
    const feed = parseFeed(response.data)
    for (const item of feed.items) {
      yield new Post(item.link, {
        title: item.title,
        author: feed.title,
        date: item.pubDate
      })
    }
  }
}

module.exports = FeedCrawler
