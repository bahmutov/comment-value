const {pipe, negate, inc} = require('ramda')
const f = pipe(
  Math.pow,
  negate, //> undefined
  inc
)
console.log(f(3, 4))
