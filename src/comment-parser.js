const la = require('lazy-ass')
const is = require('check-more-types')
const commentStarts = require('./comments').starts
la(is.strings(commentStarts), 'invalid comment starts', commentStarts)
const R = require('ramda')

const findCommentValue = s =>
  R.find(c => s.startsWith(c), commentStarts)

function init (filename, comments, emitter) {
  la(is.array(comments), 'missing list for output comments')

  const parserOptions = {
    locations: true,
    onComment (block, text, start, end, from, to) {
      if (block) {
        return
      }
      const commentStart = findCommentValue(text)
      if (!commentStart) {
        return
      }
      const index = comments.length
      const comment = {
        value: undefined,
        start,
        text,
        index,
        from,
        to,
        filename,
        commentStart
      }
      comments.push(comment)
      emitter.emit('comment', comment)
    }
  }
  return parserOptions
}

module.exports = init
