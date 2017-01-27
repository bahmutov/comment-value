const {pipe, negate, inc} = require('ramda')
const f = pipe(
  Math.pow, //> 81
  negate,
  inc
)
console.log(f(3, 4))
