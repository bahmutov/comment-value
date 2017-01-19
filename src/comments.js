// look for comments that start with these symbols
const comments = ['//>', '//=>']
// remove leading '//'
const starts = comments.map(c => c.substr(2))
module.exports = {
  comments,
  starts
}
