# Generator-workhorse

Used to make generators pause while work (requested by them) is being done.

## Install

```sh
npm install generator-workhorse
```

## Example

Say you want to use a generator to do some async work, only pulling out values
whenever the work has been done. This can be a bit tricky, because the
generator itself has no way of telling you not to pull out values of it. This
is one way of achieving this though:

```js
// your generator
function * myGenerator ({resolve}, id) {
  // will call api with the url and return the result of the promise
  const user = yield resolve(api, `/users/${id}`)
  const friends = yield resolve(api, `/friends/${user.friends}`)
  yield friends
}

// running the generator
const workhorse = require('workhorse')

const it = myGenerator(workhorse.effects, 42)

const next (err, data) => {
  if (err) return // or throw
  const {value, done} = it.next()
  if (done) return
  if (workhorse.isEffect(value)) {
    workhorse.handleEffect(value, next)
  } else {
    // some other yield
  }
}

next()
```

