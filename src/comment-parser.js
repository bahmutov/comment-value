const la = require('lazy-ass')
const is = require('check-more-types')
const {findCommentValue, findCommentVariable, isLineComment, parseLineComment} = require('./comments')

function initVariableParser (filename, comments, emitter) {
  la(is.array(comments), 'missing list for output comments')

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
      const comment = parseAsCommentVariable(text, start, end, from, to)
      if (comment) {
        comment.index = comments.length
        comments.push(comment)
        emitter.emit('comment', comment)
      }
    }
  }
  return parserOptions
}

function findVariables (lines) {
  const output = []
  lines.forEach((line, lineIndex) => {
    if (!isLineComment(line)) {
      return
    }
    const parsed = parseLineComment(line)
    la(parsed, 'could not parse line comment', line)

    const variable = findCommentVariable(parsed.comment)
    if (!variable) {
      return
    }

    const comment = {
      value: undefined,
      line,
      lineIndex,
      variable
    }
    output.push(comment)
  })
  return output
}

function parseCommentVariables (source, filename, list, emitter) {
  la(is.array(list), 'missing output list for variables')

  const lines = source.split('\n')
  const output = findVariables(lines)
  output.forEach((c, k) => {
    c.filename = filename
    c.index = list.length + k
    list.push(c)
    emitter.emit('comment', c)
  })

  output.forEach((c, k) => {
    la(is.number(c.lineIndex), 'missing line index', c)
    // account for previous insertions
    const newLineIndex = c.lineIndex + k
    const reference = `global.__instrumenter.variables[${c.index}].value`
    const store = `${reference} = ${c.variable}`
    lines.splice(newLineIndex + 1, 0, store)
  })

  return lines.join('\n')
}

function initExpressionParser (filename, comments, emitter) {
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

  const parserOptions = {
    locations: true,
    onComment (block, text, start, end, from, to) {
      if (block) {
        return
      }
      const comment = parseAsCommentValue(text, start, end, from, to)
      if (comment) {
        comment.index = comments.length
        comments.push(comment)
        emitter.emit('comment', comment)
      }
    }
  }
  return parserOptions
}

module.exports = {
  initVariableParser,
  parseCommentVariables,
  initExpressionParser
}
