module.exports = () => {
  const effects = {
    call: (fn, ...args) => ({type: 'call', fn, args}),
    cps: (fn, ...args) => ({type: 'cps', fn, args}),
    resolve: (fn, ...args) => ({type: 'resolve', fn, args}),
    wait: ms => ({type: 'wait', ms})
  }

  const handlers = {
    call: ({fn, args}, cb) => cb(null, fn(...args)),
    cps: ({fn, args}, cb) => fn(...args, cb),
    resolve: ({fn, args}, cb) => {
      fn(...args)
      .then(response => cb(null, response))
      .catch(cb)
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
      handlers[effect.type](effect, cb)
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

