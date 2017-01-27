function add (a, b) {
  return a + b
}
// (typeof add) //> undefined
add(2, 3) //> undefined
add(1, -2) //> undefined
add(10, -2) //> undefined

console.log('all done in', __filename)
