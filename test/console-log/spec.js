const la = require('lazy-ass')
const is = require('check-more-types')
const instrument = require('../../src/instrument-source')
const read = require('fs').readFileSync
const inFolder = require('path').join.bind(null, __dirname)
const R = require('ramda')

describe('console.log is special', () => {
  const source = read(inFolder('index.js'), 'utf8')
  let emitter

  beforeEach(() => {
    emitter = global.instrument
  })

  it('finds the comment', () => {
    const comments = []
    emitter.on('comment', comments.push.bind(comments))
    instrument(source)
    la(R.equals(['> 42'], R.map(R.prop('text'), comments)), comments)
  })

  it('wraps the first argument only', () => {
    const wrapped = []
    emitter.on('wrap', wrapped.push.bind(wrapped))
    instrument(source)
    la(R.equals(['2 + 40'], wrapped), wrapped)
  })
})
