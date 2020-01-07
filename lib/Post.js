const { readFileSync, promises: { readFile, readdir, stat } } = require('fs')
const { resolve } = require('path')
const mustache = require('mustache')
const matter = require('gray-matter')

const { sha1 } = require('./utils')

const postTemplate = readFileSync(require.resolve('../templates/post.md.mustache'), 'utf8')
mustache.parse(postTemplate)

const postsTemplate = readFileSync(require.resolve('../templates/posts.md.mustache'), 'utf8')
mustache.parse(postsTemplate)

class Post {
  /**
   * @param {string} link
   * @param {object} fields
   * @param {string?} fields.title
   * @param {string?} fields.author
   * @param {Date?} fields.date
   */
  constructor (link, { title, author, date }) {
    this.link = link
    if (title != null) this.title = title.trim()
    if (author != null) this.author = author
    if (date != null) {
      this.date = date
    } else {
      this.date = new Date()
    }
  }

  valueOf () {
    return this.link
  }

  toString () {
    return mustache.render(postTemplate, this)
  }

  get isoDate () {
    return this.date.toISOString()
  }

  get id () {
    return sha1(this.link)
  }

  get root () {
    return resolve(Post.root, this.id)
  }

  async exists () {
    try {
      const stats = await stat(this.root)
      if (!stats.isDirectory()) {
        throw Error(`${this.root} is not a directory.`)
      }

      return true
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error
      }
      return false
    }
  }

  static get root () {
    return resolve('docs')
  }

  static async * list () {
    const dirents = await readdir(this.root, { withFileTypes: true })

    for (const dirent of dirents) {
      if (!dirent.isDirectory()) continue
      if (dirent.name[0] === '.') continue

      const file = resolve(this.root, dirent.name, 'README.md')
      const content = await readFile(file, 'utf8')
      const { data: { link, title, author, date } } = matter(content)

      yield new Post(link, {
        title: title,
        author,
        date: new Date(date)
      })
    }
  }

  static toString (posts) {
    return mustache.render(postsTemplate, { posts })
  }
}

module.exports = Post
