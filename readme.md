Certainly, here is the content formatted in Markdown:

## agebrock-functional

### Description

agebrock-functional is a utility library designed to assist with functions that may experience long execution times or occasional failures.

### Installation

To install agebrock-functional, you can use npm:

```
npm install agebrock-functional
```

### Usage

#### Importing

```javascript
const fn = require('agebrock-functional');
// import {fs} from 'agebrock-functional';
```

#### Example Usage

```javascript
// Define your long-running function
async function longRunningFunctionAsync(a, b){
    //...
}

function longRunningFunction(a, b){
    //...
}

// Wrap the function with functional to cache the result for 2 minutes
const cachedFunc = fn({ func: longRunningFunction, ttl: 120 });

// Use cachedFunc in the same way as you would use longRunningFunction
cacheFunc(1, 2);

// For async functions, it works similarly
const cachedFunc = fn({ func: longRunningFunctionAsync, ttl: 120 });
await cacheFunc(1, 2);

// Attach a scope if needed
const cachedFunc = fn({ scope: myScope, func: longRunningFunction, ttl: 120 });

// Set a refreshInterval to renew the cache in the background every 5 seconds (disables ttl)
const fnCached = fn({ func: testFunc, refreshInterval: 5 });

// To clear the interval, set an out reference to get the controller class
const out = {};
const fnCached = fn({ func: testFunc, refreshInterval: 5, out });
out.fn.clearInterval();

// Add retry count
const fnCached = fn({ func: testFunc, refreshInterval: 5, out, {retry: 5} });
```

### Note

Ensure that you handle any errors or exceptions that may occur during function execution appropriately, especially when using caching and retry mechanisms.


