const la = require('lazy-ass')
const is = require('check-more-types')
const falafel = require('falafel')
const debug = require('debug')('comment-value')
const commentStarts = require('./comments').starts
la(is.strings(commentStarts), 'invalid comment starts', commentStarts)
const {parseCommentVariables, initExpressionParser} = require('./comment-parser')

const {isWhiteSpace} = require('./comments')
const R = require('ramda')
const beautifySource = require('./beautify')
// emit events when finding comment / instrumenting
// allows quick testing
if (!global.instrument) {
  const EventEmitter = require('events')
  global.instrument = new EventEmitter()
}
const emitter = global.instrument

function storeInIIFE (reference, value, typeReference) {
  return `(function () {
    if (typeof ${value} === 'function') {
      return function () {
        ${reference} = ${value}.apply(null, arguments);
        ${typeReference} = typeof ${reference};
        return ${reference}
      }
    } else {
      ${reference} = ${value};
      ${typeReference} = typeof ${reference};
      return ${reference}
    }
  }())`
}
function storeInBlock (reference, value, typeReference) {
  const store = `${reference} = ${value}`
  const storeType = `${typeReference} = typeof ${reference}`
  return `;{ ${store}; ${storeType}; ${reference} }`
}

function instrumentSource (source, filename) {
  la(is.string(source), 'missing source', source)

  // TODO handle multiple files by making this object global
  // and avoiding overwriting it
  const __instrumenter = global.__instrumenter || {
    comments: [],
    variables: []
  }

  function isWhiteSpaceBefore (from, comment) {
    const region = source.substr(from, comment.start - from)
    if (is.empty(region)) {
      return true
    }
    // console.log(`region "${region}" from ${from} comment starts ${comment.start}`)
    const maybe = isWhiteSpace(region)
    // console.log(`region "${region}" test ${maybe}`)
    return maybe
  }

  const isCloseComment = R.curry((line, c) => {
    return c.from.line === line || c.from.line === line + 1
  })

  const findComment = node => {
    // console.log('looking for comment for node',
      // node.source(), node.end, 'line', node.loc.end.line)
    la(node, 'missing node', node)
    // console.log(node)
    if (!node.loc) {
      // console.log('node is missing loc')
      return
    }
    la(node.loc, 'missing node location', node)
    return __instrumenter.comments
      .filter(isCloseComment(node.loc.end.line))
      .find(c => isWhiteSpaceBefore(node.end, c))
  }

  const endsBeforeInstrumentedComment = R.compose(Boolean, findComment)

  const hasNotSeen = node => {
    const c = findComment(node)
    return !c.instrumented
  }

  const isConsoleLog = node =>
    node &&
      node.type === 'CallExpression' &&
      node.callee.type === 'MemberExpression' &&
      node.callee.object.name === 'console' &&
      node.callee.property.name === 'log'

  const isConsoleLogExpression = node =>
    node.expression &&
      node.expression.type === 'CallExpression' &&
      node.expression.callee.type === 'MemberExpression' &&
      node.expression.callee.object.name === 'console' &&
      node.expression.callee.property.name === 'log'

  function instrument (node) {
    // console.log(node.type, node.end, node.source())
    // TODO can we handle individual value?
    if (node.type === 'ExpressionStatement' ||
      node.type === 'Identifier' ||
      node.type === 'CallExpression') {
      if (node.type === 'CallExpression') {
        // console.log(node.source(), node)
        // ignore top level "console.log(...)",
        // we only care about the arguments
        if (isConsoleLog(node)) {
          return
        }
      }

      if (endsBeforeInstrumentedComment(node) && hasNotSeen(node)) {
        debug('need to instrument', node.type, node.source())
        const comment = findComment(node)
        debug('will instrument "%s" for comment "%s"', node.source(), comment.text)
        comment.instrumented = true
        const reference = 'global.__instrumenter.comments[' + comment.index + '].value'
        const typeReference = 'global.__instrumenter.comments[' + comment.index + '].type'
        if (isConsoleLogExpression(node)) {
          debug('instrumenting console.log', node.source())
          // instrument inside the console.log (the first argument)
          const value = node.expression.arguments[0].source()
          emitter.emit('wrap', value)
          const store = reference + ' = ' + value
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
            storeAndReturn = storeInIIFE(reference, value, typeReference)
            emitter.emit('wrap', value)
            emitter.emit('wrap-node', {type: 'CallExpression', value})
          } else if (node.parent.type === 'MemberExpression') {
            // update the entire parent node
            const value = node.parent.source()
            emitter.emit('wrap', value)
            emitter.emit('wrap-node', {type: 'MemberExpression', value})
            let parentStore = storeInIIFE(reference, value, typeReference)
            node.parent.update(parentStore)
            return
          } else {
            emitter.emit('wrap', value)
            emitter.emit('wrap-node', {type: node.parent.type, value})
            storeAndReturn = storeInBlock(reference, value, typeReference)
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

  // first pass - find and instrument just the variables in the
  // comments
  const output1 = parseCommentVariables(source, filename,
    __instrumenter.variables, emitter)
  debug('instrumented for %d variables',
    __instrumenter.variables.length)
  __instrumenter.variables.forEach(c =>
    debug('line %d variable %s', c.lineIndex, c.variable))

  // second pass - instrument all implicit expressions
  debug('second pass - finding expressions to instrument')
  const expressionParser = initExpressionParser(
    filename, __instrumenter.comments, emitter)
  const output2 = falafel(output1, expressionParser, instrument)
  debug('instrumented for total %d expressions in comments',
    __instrumenter.comments.length)
  __instrumenter.comments.forEach(c =>
    debug('line %d expression %s', c.from.line, c.text))

  // console.log(__instrumenter.comments)
  const preamble = 'if (!global.__instrumenter) {global.__instrumenter=' +
    JSON.stringify(__instrumenter, null, 2) + '}\n'

  const sep = ';\n'
  const instrumented = preamble + sep + output2
  const beautify = true
  const beautified = beautify ? beautifySource(instrumented) : instrumented
  return beautified
}

module.exports = instrumentSource
