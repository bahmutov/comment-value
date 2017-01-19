const la = require('lazy-ass')
const is = require('check-more-types')
const falafel = require('falafel')
const debug = require('debug')('comment-value')
const commentStarts = require('./comments').starts
const R = require('ramda')

la(is.strings(commentStarts), 'invalid comment starts', commentStarts)

function instrumentSource (source, filename) {
  // TODO handle multiple files by making this object global
  // and avoiding overwriting it
  const __instrumenter = global.__instrumenter || {
    comments: []
  }

  const endsBeforeInstrumentedComment = node =>
    __instrumenter.comments.some(c => c.start === node.end + 1)
  const findComment = node =>
    __instrumenter.comments.find(c => c.start === node.end + 1)

  const isConsoleLog = node =>
    node.expression &&
      node.expression.type === 'CallExpression' &&
      node.expression.callee.type === 'MemberExpression' &&
      node.expression.callee.object.name === 'console' &&
      node.expression.callee.property.name === 'log'

  function instrument (node) {
    // TODO can also handle individual value
    if (node.type === 'ExpressionStatement' ||
      node.type === 'Identifier') {
      // console.log(node.type, node.end, node.source())

      if (endsBeforeInstrumentedComment(node)) {
        // console.log('need to instrument', node.type, node.source())
        const comment = findComment(node)
        const reference = 'global.__instrumenter.comments[' + comment.index + '].value'
        if (isConsoleLog(node)) {
          debug('instrumenting console.log', node.source())
          // instrument inside the console.log (the first argument)
          const store = reference + ' = ' + node.expression.arguments[0].source()
          const storeAndReturn = '(function () {' + store + '; return ' + reference + '}())'
          const printStored = 'console.log(' + storeAndReturn + ')'
          node.update(printStored)
        } else {
          // console.log(comment)
          const store = reference + ' = ' + node.source()
          const storeAndReturn = ';(function () {' + store + '; return ' + reference + '}())'
          node.update(storeAndReturn)
        }
      }
    }
  }

  const findCommentValue = s =>
    R.find(c => s.startsWith(c), commentStarts)

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
      // console.log('comment', arguments)
      const index = __instrumenter.comments.length
      __instrumenter.comments.push({
        value: undefined,
        start,
        text,
        index,
        from,
        to,
        filename,
        commentStart
      })
    }
  }
  const output = falafel(source, parserOptions, instrument)
  debug('instrumented for %d comments', __instrumenter.comments.length)
  // console.log(__instrumenter.comments)
  const preamble = 'if (!global.__instrumenter) {global.__instrumenter=' +
    JSON.stringify(__instrumenter, null, 2) + '}\n'
  // console.log(preamble)
  // console.log('output source\n' + output)

  const sep = ';\n'
  const instrumented = preamble + sep + output
  return instrumented
}

module.exports = instrumentSource
