const la = require('lazy-ass')
const is = require('check-more-types')
const {findCommentValue, findCommentVariable} = require('./comments')

function init (filename, comments, emitter) {
  la(is.array(comments), 'missing list for output comments')

  const parseAsCommentValue = (text, start, end, from, to) => {
    const commentStart = findCommentValue(text)
    if (!commentStart) {
      return
    }
    const comment = {
      value: undefined,
      start,
      text,
      from,
      to,
      filename,
      commentStart
    }
    return comment
  }

  const parseAsCommentVariable = (text, start, end, from, to) => {
    const variable = findCommentVariable(text)
    if (!variable) {
      return
    }

    const comment = {
      value: undefined,
      start,
      text,
      from,
      to,
      filename,
      variable
    }
    return comment
  }

  const parserOptions = {
    locations: true,
    onComment (block, text, start, end, from, to) {
      if (block) {
        return
      }
      let comment = parseAsCommentValue(text, start, end, from, to)
      if (!comment) {
        comment = parseAsCommentVariable(text, start, end, from, to)
      }
      if (comment) {
        comment.index = comments.length
        comments.push(comment)
        emitter.emit('comment', comment)
      }
    }
  }
  return parserOptions
}

module.exports = init
