module.exports = () => {
  const effects = {
    call: (fn, ...args) => ({type: 'call', fn, args}),
    cps: (fn, ...args) => ({type: 'cps', fn, args}),
    resolve: (fn, ...args) => ({type: 'resolve', fn, args}),
    wait: ms => ({type: 'wait', ms})
  }

  const handlers = {
    call: ({fn, args}, cb) => cb(fn(...args)),
    cps: ({fn, args}, cb) => {
      fn(...args, (err, ..._args) => {
        if (err) throw Error(`${fn.name} threw with: ${err}`)
        else cb(..._args)
      })
    },
    resolve: ({fn, args}, cb) => {
      fn(...args)
      .then(response => cb(response))
      .catch(err => {
        throw Error(`${fn.name} threw with: ${err}`)
      })
    },
    wait: ({ms}, cb) => setTimeout(cb, ms)
  }

  const extend = method => {
    if (Array.isArray(method)) {
      method.forEach(extend)
    } else {
      effects[method.type] = method.effect
      handlers[method.type] = method.handle
    }
  }

  const isEffect = value => value && typeof handlers[value.type] === 'function'
  const isEffectOfType = (type, value) => isEffect(value) && value.type === type

  const handleEffect = (effect, cb) => {
    if (!isEffect(effect)) cb(Error(`Expected an effect, got ${effect} with type ${effect.type}`))
    try {
      handlers[effect.type](effect, (...args) => cb(null, ...args))
    } catch (e) {
      cb(e)
    }
  }

  return {
    effects,
    extend,
    isEffect,
    isEffectOfType,
    handleEffect
  }
}

