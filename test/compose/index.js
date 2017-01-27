function wrap (fn) {
  console.log('running function', fn.name)
  return fn()
}

const foo = () => 'foo'

const result = wrap(
  foo //> undefined
)
console.assert(result === 'foo', result)
