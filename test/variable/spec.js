const la = require('lazy-ass')
const is = require('check-more-types')
const instrument = require('../../src/instrument-source')
const read = require('fs').readFileSync
const inFolder = require('path').join.bind(null, __dirname)
const R = require('ramda')

describe.skip('variable value', () => {
  const source = read(inFolder('index.js'), 'utf8')
  let emitter

  beforeEach(() => {
    emitter = global.instrument
  })

  it('finds the variable comment', () => {
    const comments = []
    emitter.on('comment', c => comments.push(c))
    instrument(source)
    la(R.equals(['foo:'], comments), comments)
  })

  it.skip('wraps the first argument only', () => {
    const wrapped = []
    emitter.on('wrap', wrapped.push.bind(wrapped))
    instrument(source)
    la(R.equals(['2 + 40'], wrapped), wrapped)
  })
})
