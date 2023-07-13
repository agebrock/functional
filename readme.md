# Functional

Little helper for for functions that take to long and sometimes does not work...

## function cache


```
    // use any existing function in your code..
    async longRunningFunctionAsync(a, b){
        //...
    }

    longRunningFunction(a, b){
        //...
    }
   
   // use functional to wrap the function and cache the result for 2 minutes.
   const cachedFunc = fn({ func: longRunningFunction, ttl: 120});
   
   // use cachedFunc in the same way as you would use longRunningFunction
    cacheFunc(1, 2);

    // for async functions it works in the same way ..
    const cachedFunc = fn({ func: longRunningFunction, ttl: 120});
    await cacheFunc(1,2);


    // attach a scope if needed ..
    const cachedFunc = fn({ scope:myScope, func: longRunningFunction, ttl: 120});

    // set an refreshInterval to renew the cache in the background every 5 sec (this will disable ttl)
    const fnCached = fn({ func: testFunc, refreshInterval: 5 });

    // to clear the interval set an out reference to get the controller class.
    const out = {};
    const fnCached = fn({ func: testFunc, refreshInterval: 5, out });
    out.fn.clearInterval();
    

    //add retry count ..
     const fnCached = fn({ func: testFunc, refreshInterval: 5, out, {retry: 5} });
     
    
```