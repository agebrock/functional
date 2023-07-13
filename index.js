import NodeCache from "node-cache";
import debug from 'debug';
const myCache = new NodeCache({ stdTTL: 60 * 30, checkperiod: 120 });
const log = debug('cache-fn');
let cacheCounter = 0;


class Fn {
    constructor(scope, func) {
        this.cacheId = cacheCounter++;
        this.scope = scope;
        this.func = func;
        this.scoped = this.func.bind(scope);
        this.isAsync = func.toString().substr(0, 5) === 'async';
        this.countErrorsTotal = 0;
        this.countErrorsSession = 0;
        this.intervalCollection = [];
        /**
         * in future we may store every execution context in order to change the settings of the cache
         * only for this context
         */
        //this.executionContextCollection = new Map();
    }
    clearInterval(){
        this.intervalCollection.forEach(interval => {
            clearInterval(interval);
        });
    }
    retry(retry) {
        if (!retry){
            log('skip retry');
            return this.func;
        } 
        const self = this;
        return function () {
            let result;
            for (let i = 0; i < retry; i++) {
                try {
                    log('retry', i)
                    result = self.func.apply(self.scope, arguments);
                    self.countErrorsSession = 0;
                    log('retry success', i)
                    break;
                } catch (e) {
                    log('retry failed', i)
                    self.countErrorsTotal++;
                    self.countErrorsSession++;
                }
            }
            return result;
        };
    }
    retryAsync(retry) {
        const self = this;
        if (!retry) {
            log('skip retry');
            return this.func;
        }
        return async function () {
            let result;
            for (let i = 0; i < retry; i++) {
                try {
                    log('retry', i)
                    result = await self.func.apply(self.scope, arguments);
                    self.countErrorsSession = 0;
                    log('retry success', i)
                    break;
                } catch (e) {
                    log('retry falied', i)
                    self.countErrorsTotal++;
                    self.countErrorsSession++;
                }
            }
            return result;
        };
    }

    cache(ttl = 0, refreshInterval = 0, retry = 0) {
        const self = this;
        const funcId = this.cacheId;
        const isAsync = this.isAsync;
        const scope = this.scope;
        const func = this.func;

        function validate(a) {
            const args = Array.prototype.slice.call(a);
            const cacheKey = Buffer.from(funcId + JSON.stringify(args)).toString('base64');
            let result = myCache.get(cacheKey);
            return { args, cacheKey, result }
        }



        let modFunc = func;
        this.modFunc = func.bind(scope);
        if (isAsync) {
            if (retry) {
                modFunc = self.retryAsync(retry);
            }


            return async function () {
                let { args, cacheKey, result } = validate(arguments);

                function createContext(){
                   
                    return async ()=>{
                        log('run context', i)
                        result = await modFunc.apply(scope, args);
                        myCache.set(cacheKey, result, ttl);
                        return result;
                    }
                }
                const context = createContext();
               // self.executionContextCollection.set(cacheKey, context);
                if (result === undefined) {
                    result = await modFunc.apply(scope, args);
                    if (refreshInterval) {
                        log('has refreshInterval');
                        ttl = refreshInterval + 4000;
                        self.intervalCollection.push(setInterval(context, refreshInterval * 1000));
                    }
                    myCache.set(cacheKey, result, ttl);
                    return result;
                }
                return result;
            }

        } else {
            if (retry) {
                modFunc = self.retry(retry);
            }

            return function () {
                let { args, cacheKey, result } = validate(arguments);

                function createContext(){
                    return ()=>{
                        log('run context')
                        result = modFunc.apply(scope, args);
                        myCache.set(cacheKey, result, ttl);
                        return result;
                    }
                }
                const context = createContext();
               // self.executionContextCollection.set(cacheKey, context);
                if (result === undefined) {
                    result = modFunc.apply(scope, args);
                    if (refreshInterval) {
                        log('has refreshInterval');
                        ttl = refreshInterval + 4000;
                        self.intervalCollection.push(setInterval(context, refreshInterval * 1000));
                    }
                    myCache.set(cacheKey, result, ttl);
                    return result;
                }
                return result;
            }
        }
    }

}




function retry({scope = null, func, retry}) {
    const f =  fn(scope, func);
    if(f.isAsync){
        return f.retryAsync(retry);
    }else{
        return f.retry(retry);
    }
    
}

function fn({scope, func, ttl = 0, refreshInterval=0, retry=0, out = {}}) {
    const fn =  new Fn(scope, func);
    out.fn = fn;
    return fn.cache(ttl, refreshInterval, retry);
}



export { fn };