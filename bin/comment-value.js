#!/usr/bin/env node

const debug = require('debug')('comment-value')
const program = require('commander')
const spawn = require('cross-spawn')

program
  .option('-w, --watch', 'Keep watching input files')
  .parse(process.argv)

function runNode(inputFilename) {
  debug('running program %s', inputFilename)
  return new Promise((resolve, reject) => {
    const child = spawn('node', [inputFilename], {stdio: 'inherit'})
    child.on('end', (exit) => {
      debug('node is done, exit code %d', exit)
      if (exit) {
        return reject(new Error('Node exit code ' + exit))
      }
      resolve()
    })
  })
}

runNode(program.args[0])
  .catch(err => {
    console.error(err)
    process.exit(1)
  })

