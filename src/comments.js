const R = require('ramda')

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
function findCommentValue (s) {
  return R.find(c => s.startsWith(c), starts)
}

// tries to find the variable name (if any) used in special
// comment, for example " fooBar: anything here" returns match "fooBar"
function findCommentVariable (s) {
  const r = /^ (\w+): /
  const matches = r.exec(s)
  return matches && matches[1]
}

module.exports = {
  comments,
  starts,
  isWhiteSpace,
  findCommentValue,
  findCommentVariable
}
