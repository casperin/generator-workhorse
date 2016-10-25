const tape = require('tape')
const workhorse = require('../.')()

const {call, cps, resolve} = workhorse.effects

tape('Effect: call', t => {
  const fn1 = foo => {
    t.equal(foo, 'foo', 'call:fn1 was called wit arg')
    return 'bar'
  }
  const effect1 = call(fn1, 'foo')
  workhorse.handleEffect(effect1, (err, bar) => t.equal(bar, 'bar', 'Callback for call:effet1 was called'))

  const fn2 = () => { throw Error('call:fn2 throwing') }
  const effect2 = call(fn2)
  workhorse.handleEffect(effect2, err => t.ok('call:fn2 returned an error'))

  t.end()
})

tape('Effect: cps', t => {
  const fn1 = (foo, bar, cb) => cb(null, foo + bar)
  const effect1 = cps(fn1, 'foo', 'bar')
  workhorse.handleEffect(effect1, (err, foobar) => t.equal(foobar, 'foobar', 'cps:fn1 reterned correctsy'))

  t.end()
})

tape('Effect: resolve', t => {
  const fn1 = foo => Promise.resolve(foo)
  const effect1 = resolve(fn1, 'foo')
  workhorse.handleEffect(effect1, (err, foo) => t.equal(foo, 'foo', 'resolve:fn1 worked!'))

  const fn2 = () => Promise.reject('Some error')
  const effect2 = resolve(fn2)
  workhorse.handleEffect(effect2, err => t.ok(err, 'resolve:fn2 threw up'))

  t.end()
})

