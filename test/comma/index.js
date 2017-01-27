const {pipe, negate, inc} = require('ramda')
const f = pipe(
  Math.pow,
  negate, //> -81
  inc     //> -80
)
console.log(f(3, 4)) //> -80
