const la = require('lazy-ass')
const is = require('check-more-types')
const instrument = require('../../src/instrument-source')
const read = require('fs').readFileSync
const inFolder = require('path').join.bind(null, __dirname)
const R = require('ramda')

describe('property functions', () => {
  const source = read(inFolder('index.js'), 'utf8')
  let emitter

  beforeEach(() => {
    emitter = global.instrument
  })

  it('instruments', () => {
    const comments = []
    const output = instrument(source)
    la(is.unemptyString(output), 'did not get output')
  })

  it('finds the comment', () => {
    const comments = []
    emitter.on('comment', comments.push.bind(comments))
    instrument(source)
    la(R.equals(['> 81'], R.map(R.prop('text'), comments)), comments)
  })

  it('wraps the property expression', () => {
    const wrapped = []
    emitter.on('wrap', wrapped.push.bind(wrapped))
    instrument(source)
    la(R.equals(['Math.pow'], wrapped), wrapped)
  })
})
