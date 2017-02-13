'use strict'

const la = require('lazy-ass')
const is = require('check-more-types')

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

describe('line comment', () => {
  const {isLineComment} = require('./comments')
  it('finds line comment from the start of the line', () => {
    la(isLineComment('//something'))
    la(isLineComment('// something'))
  })

  it('finds line comment', () => {
    la(isLineComment(' //something'))
    la(isLineComment('   // something'))
  })

  it('does not find lines with something else', () => {
    la(!isLineComment(' foo //something'))
  })

  describe('parsing line comment', () => {
    const {parseLineComment} = require('./comments')
    it('parses //something', () => {
      const line = '  // something'
      const p = parseLineComment(line)
      la(is.object(p), 'expected object', p, 'from', line)
      la(p.line === line, p)
      la(p.comment === ' something', 'wrong comment', p, 'from', line)
    })
  })
})

describe('comment variable parser', () => {
  const {findCommentVariable} = require('./comments')
  it('finds foo', () => {
    const s = ' foo: whatever here'
    const variable = findCommentVariable(s)
    la(variable === 'foo', variable, 'from', s)
  })

  it('finds bare foo', () => {
    const s = ' foo:'
    const variable = findCommentVariable(s)
    la(variable === 'foo', variable, 'from', s)
  })

  it('finds variable with space after', () => {
    const s = ' foo: '
    const variable = findCommentVariable(s)
    la(variable === 'foo', variable, 'from', s)
  })

  it('finds fooBar', () => {
    const s = ' fooBar: whatever here'
    const variable = findCommentVariable(s)
    la(variable === 'fooBar', variable, 'from', s)
  })

  it('ignores http links', () => {
    const s = 'http://foo.com'
    const variable = findCommentVariable(s)
    la(!variable, 'found variable name', variable, 'in', s)
  })

  it('ignores names with text after', () => {
    const s = 'foo:no'
    const variable = findCommentVariable(s)
    la(!variable, 'found variable name', variable, 'in', s)
  })
})
