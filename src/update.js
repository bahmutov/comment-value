const fs = require('fs')
const path = require('path')
const la = require('lazy-ass')
const is = require('check-more-types')
const debug = require('debug')('comment-value')

function updateFile (filename, results) {
  debug('updating comment values in file %s', filename)
  la(is.unemptyString(filename), 'missing filename', filename)

  const source = fs.readFileSync(filename, 'utf8')
  if (!results) {
    const resultsFilename = path.join(process.cwd(), 'results.json')
    debug('loading results from file %s', resultsFilename)
    results = require(resultsFilename)
  }

  const forThisFile = comment => comment.filename === filename

  const lines = source.split('\n')
  results.comments
    .filter(forThisFile)
    .forEach(updateComment)

  function updateComment (c) {
    const commentStart = c.commentStart
    la(is.unemptyString(commentStart), 'missing comment start', c)
    // console.log('updating comment')
    // console.log(c)
    // line starts with 1
    la(c.from.line === c.to.line, 'line mismatch', c)
    const line = lines[c.from.line - 1]
    la(line, 'missing line', c.from.line - 1, 'for comment', c)
    // console.log('updating line', line, 'with value', c.value)
    const k = line.indexOf(commentStart)
    la(k >= 0, 'line does not have comment', k, 'for comment', c)
    const newComment = commentStart + ' ' + JSON.stringify(c.value)
    const updatedLine = line.substr(0, k) + newComment
    lines[c.from.line - 1] = updatedLine
  }

  const updatedSource = lines.join('\n')

  if (updatedSource !== source) {
    debug('updated source is different in %s', filename)
    fs.writeFileSync(filename, updatedSource, 'utf8')
  } else {
    debug('file %s is the same as before, not overwriting', filename)
  }
}

module.exports = updateFile

if (!module.exports) {
  const sourceFilename = path.join(process.cwd(), process.argv[2])
  updateFile(sourceFilename)
}
