// manually wrapped function "foo" in the chain

const values = {
  foo: undefined
}

function wrap (fn) {
  return fn()
}

const foo = () => 'foo'

const result = wrap(
  (function () {
    if (typeof foo === 'function') {
      const result = foo.apply(null, arguments)
      values.foo = result
      return result
    } else {
      values.foo = foo
      return foo
    }
  })
)
console.assert(result === 'foo', result)

console.log('foo result', values.foo)
