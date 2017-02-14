const R = require('ramda')
const la = require('lazy-ass')
const is = require('check-more-types')

// look for comments that start with these symbols
const comments = ['//>', '//=>', '// >', '// >>', '// =>', '//~>', '// ~>']
// remove leading '//'
const starts = comments.map(c => c.substr(2))
// checks if source is separated by white space from a "special" comment
function isWhiteSpace (text) {
  const maybe = /^,?\s+$/.test(text)
  return maybe
}

// finds which special comment start (if any) is present in the
// given comment
// for example //>
function findCommentValue (s) {
  return R.find(c => s.startsWith(c), starts)
}

// finds if we want a type of the preceding expression
// for example
//   add(2, 3) // ::
// will be
//   add(2, 3) // :: number
function findCommentType (s) {
  const typeStarts = ['::', ' ::']
  return R.find(c => s.startsWith(c), typeStarts)
}

// tries to find the variable name (if any) used in special
// comment, for example " fooBar: anything here" returns match "fooBar"
function findCommentVariable (s) {
  const r = /^ (\w+):(?:\s+|\n|$)/
  const matches = r.exec(s)
  return matches && matches[1]
}

// finds variable names where we should output type
// like "foo::"
function findCommentVariableType (s) {
  const r = /^ (\w+)::(?:\s+|\n|$)/
  const matches = r.exec(s)
  return matches && matches[1]
}

function isLineComment (line) {
  const r = /^\s*\/\//
  return r.test(line)
}

function parseLineComment (line) {
  la(isLineComment(line), 'not a line comment', line)
  const commentStarts = line.indexOf('//')
  la(is.found(commentStarts), 'could not find //', line)
  const comment = line.substr(commentStarts + 2)

  return {
    line,
    commentStarts,
    comment
  }
}

module.exports = {
  comments,
  starts,
  isWhiteSpace,
  findCommentValue,
  findCommentVariable,
  findCommentVariableType,
  isLineComment,
  parseLineComment,
  findCommentType
}
