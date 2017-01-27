var R = require('ramda')
R.compose(
  Math.abs,
  R.add(1),
  R.multiply(2) //> undefined
)(-4)
