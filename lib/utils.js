const { createHash } = require('crypto')

/**
 * @param {string} data
 */
exports.sha1 = function sha1 (data) {
  return createHash('sha1')
    .update(data, 'ascii')
    .digest('hex')
}
