const { promises: { mkdir, writeFile } } = require('fs')
const { resolve } = require('path')

const puppeteer = require('puppeteer')

const Post = require('./Post')

class Writer {
  /**
   * @param {import('./Post')} post
   */
  constructor (post) {
    this.post = post
  }

  async write () {
    const root = this.post.root
    await mkdir(root, { recursive: true })
    const filename = resolve(root, 'README.md')
    await writeFile(filename, this.post.toString())
  }

  /** @type {Promise<import('puppeteer').Browser>} */
  get browser () {
    if (!('_browser' in Writer)) {
      Writer._browser = puppeteer.launch({
        args: ['--font-render-hinting=none'],
        defaultViewport: {
          width: 640,
          height: 960,
          isMobile: true
        }
      })
    }
    return Writer._browser
  }

  async screenshot () {
    const browser = await this.browser
    const page = await browser.newPage()
    try {
      await page.goto(this.post.link, { waitUntil: 'load' })
      await page.screenshot({
        path: resolve(this.post.root, 'screenshot.png'),
        fullPage: true
      })
    } finally {
      await page.close()
    }
  }

  static async write (posts) {
    const filename = resolve(Post.root, 'README.md')
    await writeFile(filename, Post.toString(posts))
  }
}

module.exports = Writer
