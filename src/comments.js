// look for comments that start with these symbols
const comments = ['//>', '//=>']
// remove leading '//'
const starts = comments.map(c => c.substr(2))
// checks if source is separated by white space from a "special" comment
function isWhiteSpace (text) {
  const maybe = /^,?\s+$/.test(text)
  return maybe
}

module.exports = {
  comments,
  starts,
  isWhiteSpace
}
