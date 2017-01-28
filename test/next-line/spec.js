const la = require('lazy-ass')
const is = require('check-more-types')
const instrument = require('../../src/instrument-source')
const read = require('fs').readFileSync
const inFolder = require('path').join.bind(null, __dirname)
const R = require('ramda')

describe('comment on next line', () => {
  const source = read(inFolder('index.js'), 'utf8')
  let emitter

  beforeEach(() => {
    emitter = global.instrument
  })

  it('finds the comments', () => {
    const comments = []
    emitter.on('comment', c => comments.push(c.text))
    instrument(source)
    la(R.equals(['=> 30', '> 9'], comments), comments)
  })

  it('wraps the right stuff', () => {
    const wrap = []
    emitter.on('wrap', w => wrap.push(w))
    instrument(source)
    la(R.equals(['(10 + 20);', '3 * 3'], wrap), wrap)
  })
})
