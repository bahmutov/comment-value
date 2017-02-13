const la = require('lazy-ass')
const is = require('check-more-types')
const instrument = require('../../src/instrument-source')
const read = require('fs').readFileSync
const inFolder = require('path').join.bind(null, __dirname)
const R = require('ramda')

describe('variable types', () => {
  const source = read(inFolder('index.js'), 'utf8')
  let emitter

  beforeEach(() => {
    emitter = global.instrument
  })

  it('finds the variable type comment', () => {
    const variables = []
    emitter.on('comment', c => variables.push(c.variable))
    instrument(source)
    la(R.equals(['foo', 'life'], variables), variables)
  })
})
