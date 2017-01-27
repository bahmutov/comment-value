const la = require('lazy-ass')
const is = require('check-more-types')
const falafel = require('falafel')
const debug = require('debug')('comment-value')
const commentStarts = require('./comments').starts
const {isWhiteSpace} = require('./comments')
const R = require('ramda')
const beautifySource = require('./beautify')

la(is.strings(commentStarts), 'invalid comment starts', commentStarts)

function storeInIIFE (reference, value) {
  return `(function () {
    if (typeof ${value} === 'function') {
      return function () {
        ${reference} = ${value}.apply(null, arguments)
        return ${reference}
      }
    } else {
      ${reference} = ${value};
      return ${reference}
    }
  }())`
}
function storeInBlock (reference, value) {
  const store = reference + ' = ' + value
  return `;{ ${store}; ${reference} }`
}

function instrumentSource (source, filename) {
  la(is.string(source), 'missing source', source)

  // TODO handle multiple files by making this object global
  // and avoiding overwriting it
  const __instrumenter = global.__instrumenter || {
    comments: []
  }

  function isWhiteSpaceBefore (from, comment) {
    const region = source.substr(from, comment.start - from)
    // console.log(`region "${region}" from ${from} comment starts ${comment.start}`)
    const maybe = isWhiteSpace(region)
    // console.log(`region "${region}" test ${maybe}`)
    return maybe
  }

  const findComment = node => {
    // console.log('looking for comment for node',
      // node.source(), node.end, 'line', node.loc.end.line)
    return __instrumenter.comments
      .filter(c => c.from.line === node.loc.end.line)
      .find(c => isWhiteSpaceBefore(node.end, c))
  }

  const endsBeforeInstrumentedComment = R.compose(Boolean, findComment)

  const hasNotSeen = node => {
    const c = findComment(node)
    return !c.instrumented
  }

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
      // console.log(node.source(), node)

      if (endsBeforeInstrumentedComment(node) && hasNotSeen(node)) {
        // console.log('need to instrument', node.type, node.source())
        const comment = findComment(node)
        debug('will instrument "%s" for comment "%s"', node.source(), comment.text)
        comment.instrumented = true
        const reference = 'global.__instrumenter.comments[' + comment.index + '].value'
        if (isConsoleLog(node)) {
          debug('instrumenting console.log', node.source())
          // instrument inside the console.log (the first argument)
          const store = reference + ' = ' + node.expression.arguments[0].source()
          const storeAndReturn = '(function () {' + store + '; return ' + reference + '}())'
          const printStored = 'console.log(' + storeAndReturn + ')'
          node.update(printStored)
        } else {
          // console.log(node)
          const value = node.source()
          debug(`instrumenting ${node.type} value ${value}`)
          debug('parent node type %s source %s',
            node.parent.type, node.parent.source())
          // debug('grandparent node type %s source %s',
          //   node.parent.parent.type, node.parent.parent.source())

          let storeAndReturn
          if (node.parent.type === 'CallExpression') {
            storeAndReturn = storeInIIFE(reference, value)
          } else if (node.parent.type === 'MemberExpression') {
            // update the entire parent node
            let parentStore = storeInIIFE(reference, node.parent.source())
            node.parent.update(parentStore)
            return
          } else {
            storeAndReturn = storeInBlock(reference, value)
          }

          if (node.parent.parent &&
            node.parent.parent.type === 'ExpressionStatement') {
            node.update(';' + storeAndReturn)
          } else {
            node.update(storeAndReturn)
          }
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
  const beautify = true
  const beautified = beautify ? beautifySource(instrumented) : instrumented
  return beautified
}

module.exports = instrumentSource
