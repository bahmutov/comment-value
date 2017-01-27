var R = require('ramda')
var classyGreeting = (firstName, lastName) =>
  "The name's " + lastName + ", " + firstName + " " + lastName
var yellGreeting = R.compose(
  R.toUpper,     //=> "THE NAME'S BOND, JAMES BOND"
  classyGreeting //=> "The name's Bond, James Bond"
);
yellGreeting('James', 'Bond'); //=> "THE NAME'S BOND, JAMES BOND"

R.compose(
  Math.abs,     //=> 7
  R.add(1),     //=> -7
  R.multiply(2) //=> -8
)(-4) //=> 7
