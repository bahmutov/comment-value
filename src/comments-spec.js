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

  it('does not match braces', () => {
    la(!isWhiteSpace('()'))
    la(!isWhiteSpace('( )'))
  })
})
