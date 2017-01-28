'use strict'

const la = require('lazy-ass')

/* global describe, it */
describe('comments white space', () => {
  const {isWhiteSpace} = require('./comments')

  it('matches 1 space', () => {
    la(isWhiteSpace(' '))
  })

  it('matches 2 spaces', () => {
    la(isWhiteSpace('  '))
  })

  it('allows opening comma', () => {
    la(isWhiteSpace(',  '))
  })

  it('passes newlines', () => {
    la(isWhiteSpace('\n  '))
  })

  it('does not match braces', () => {
    la(!isWhiteSpace('()'))
    la(!isWhiteSpace('( )'))
  })
})

describe('comment variable parser', () => {
  const {findCommentVariable} = require('./comments')
  it('finds foo', () => {
    const s = ' foo: whatever here'
    const variable = findCommentVariable(s)
    la(variable === 'foo', variable, 'from', s)
  })

  it('finds fooBar', () => {
    const s = ' fooBar: whatever here'
    const variable = findCommentVariable(s)
    la(variable === 'fooBar', variable, 'from', s)
  })
})
