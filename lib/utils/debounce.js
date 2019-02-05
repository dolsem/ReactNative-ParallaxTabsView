const debounce = (fn, { interval = 1000 } = {}) => {
  let target;
  let name;
  let descriptor;
  if (fn instanceof Array) {
    [target, name, descriptor] = fn;
    fn = target[name];
  }

  let intervalTimeout;
  function wrappedFunction(...args) {
    if (!intervalTimeout) {
      fn.apply(this, args);
      intervalTimeout = setTimeout(() => { intervalTimeout = null }, interval);
    }
  }

  if (descriptor) {
    descriptor.value = wrappedFunction;
    return descriptor;
  }

  return wrappedFunction;
}

export default (fnOrOptsOrInterval, maybeOptsOrInterval) => {
  if (typeof fnOrOptsOrInterval === 'function') {
    return debounce(
      fnOrOptsOrInterval,
      typeof maybeOptsOrInterval === 'object' ? maybeOptsOrInterval : { interval: maybeOptsOrInterval }
    );
  }
  else if (typeof fnOrOptsOrInterval === 'object') return (...args) => debounce(args, fnOrOptsOrInterval);
  else return (...args) => debounce(args, { interval: fnOrOptsOrInterval });
}