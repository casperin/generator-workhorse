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

function * wrapper (gen, id) {
  const it = gen(workhorse.effects, id)
  let result

  while (true) {
    const {value, done} = it.next(result)
    if (done) return
    if (workhorse.isEffect(value)) {
      result = yield value
    } else {
      // You got your friends
    }
  }
}

const handle = it => {
  const next = (err, data) => {
    if (err) return
    const {value, done} = it.next(data)
    workhorse.handleEffect(value, next)
  }
  next()
}

handle(wrapper(gen, 42))
```

