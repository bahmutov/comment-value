const la = require('lazy-ass')
const is = require('check-more-types')
const instrument = require('../src/instrument-source')
const R = require('ramda')

describe.only('composed types', () => {
  const source = `
    const R = require('ramda')
    const pipe = R.pipe(
      R.inc,          //::
      R.multiply(10)  //>
    )
    pipe(-4)
  `
  let emitter

  beforeEach(() => {
    emitter = global.instrument
    delete global.__instrumenter
  })

  it('finds the special comments', () => {
    const starts = []
    emitter.on('comment', c => starts.push(c.commentStart))
    instrument(source)
    la(R.equals(['::', '>'], starts), starts)
  })

  it('evaluates original source', () => {
    const result = eval(source)
    la(result === -30, result)
  })

  it('evaluates instrumented source', () => {
    const s = instrument(source)
    const result = eval(s)
    la(result === -30, result)
    la(global.__instrumenter.comments.length === 2,
      global.__instrumenter.comments)
  })

  it('keeps type for first comment', () => {
    const s = instrument(source)
    const result = eval(s)
    const first = global.__instrumenter.comments[0]
    la(first.find === 'type', 'should find type', first)
    la(first.type === 'number', 'found type', first)
  })
})
