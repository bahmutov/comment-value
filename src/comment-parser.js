const la = require('lazy-ass')
const is = require('check-more-types')
const comments = require('./comments')
const {
  findCommentValue,
  findCommentType,
  findCommentVariable,
  findCommentVariableType,
  isLineComment,
  parseLineComment
} = comments

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
    if (variable) {
      la(is.unemptyString(variable), 'expected variable name', variable,
        'from', parsed.comment)
      const comment = {
        find: 'value',
        line,
        lineIndex,
        variable
      }
      output.push(comment)
      return
    }

    const variableType = findCommentVariableType(parsed.comment)
    if (variableType) {
      la(is.unemptyString(variableType),
        'expected variable name for type', variableType,
        'from', parsed.comment)
      const comment = {
        find: 'type',
        line,
        lineIndex,
        variable: variableType
      }
      output.push(comment)
    }
  })
  return output
}

function parseCommentVariables (source, filename, list, emitter) {
  la(is.array(list), 'missing output list for variables')

  const lines = source.split('\n')
  const output = findVariables(lines)
  const initialLength = list.length

  output.forEach((c, k) => {
    c.filename = filename
    c.index = initialLength + k
    list.push(c)
    emitter.emit('comment', c)
  })

  output.forEach((c, k) => {
    la(is.number(c.lineIndex), 'missing line index', c)
    // account for previous insertions
    const newLineIndex = c.lineIndex + k
    const reference = `global.__instrumenter.variables[${c.index}].value`
    let what
    if (c.find === 'value') {
      what = `${c.variable}`
    } else if (c.find === 'type') {
      what = `typeof ${c.variable}`
    } else {
      throw new Error(`Unknown info to find ${c.find} for variable ${c.variable}`)
    }
    const store = `${reference} = ${what}`
    lines.splice(newLineIndex + 1, 0, store)
  })

  return lines.join('\n')
}

function initExpressionParser (filename, comments, emitter) {
  la(is.array(comments), 'missing list for output comments')

  const parseAsCommentValue = (text, start, end, from, to) => {
    let commentStart
    commentStart = findCommentValue(text)
    if (commentStart) {
      const comment = {
        find: 'value',
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

    commentStart = findCommentType(text)
    if (commentStart) {
      const comment = {
        find: 'type',
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
