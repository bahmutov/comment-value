const la = require('lazy-ass')
const is = require('check-more-types')
const instrument = require('../../src/instrument-source')
const read = require('fs').readFileSync
const inFolder = require('path').join.bind(null, __dirname)
const R = require('ramda')

describe('expression type', () => {
  const source = read(inFolder('index.js'), 'utf8')
  let emitter

  beforeEach(() => {
    emitter = global.instrument
  })

  it('finds the variable type comment', () => {
    const starts = []
    emitter.on('comment', c => starts.push(c.commentStart))
    instrument(source)
    la(R.equals([' ::'], starts), starts)
  })

  it('wraps the right expressions', () => {
    const wraps = []
    emitter.on('wrap', s => wraps.push(s))
    instrument(source)
    la(R.equals(['add(2, 3)'], wraps), wraps)
  })

  it('wraps the right AST node type', () => {
    const nodeTypes = []
    emitter.on('wrap-node', s => nodeTypes.push(s.type))
    instrument(source)
    la(R.equals(['ExpressionStatement'], nodeTypes), nodeTypes)
  })
})
