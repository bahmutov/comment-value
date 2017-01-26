function wrap (fn) {
  return fn()
}

const foo = () => 'foo'

const result = wrap(
  foo //>
)
console.assert(result === 'foo', result)
