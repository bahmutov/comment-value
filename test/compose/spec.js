const la = require('lazy-ass')
const is = require('check-more-types')
const instrument = require('../../src/instrument-source')
const read = require('fs').readFileSync
const inFolder = require('path').join.bind(null, __dirname)

describe('compose with curried functions', () => {
  const source = read(inFolder('curried-compose.js'), 'utf8')

  it('instruments', () => {
    const output = instrument(source)
    console.log(output)
    la(is.unemptyString(output), 'did not get output')
  })
})
