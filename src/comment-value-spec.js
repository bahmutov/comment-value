'use strict'

const la = require('lazy-ass')

/* global describe, it */
describe('comment-value', () => {
  const r = /^\s+$/
  it('matches 1 space', () => {
    la(r.test(' '))
  })

  it('matches 2 spaces', () => {
    la(r.test('  '))
  })

  it('does not match braces', () => {
    la(!r.test('()'))
    la(!r.test('( )'))
  })
})
