const assert = require('node:assert');
const { mock, test } = require('node:test');
const fn = require('../index').fn;

test('async retry', async (t) => {
    let i = 0;

    async function testFunc() {
        i++;
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (i == 1) {
                    return reject(new Error('test async retry'));
                }
                resolve(i++);
            }, 100);
        });
    }


    const funky = fn({func: testFunc, retry: 2})
    const result = await funky();
    assert.strictEqual(result, 2);
});

test('sync retry', (t) => {
    let i = 0;
    function testFunc() {
        i++;
        if (i == 1) {
            throw new Error('test sync retry');
        }
        return i;
    }
    const out = {}
    const funky = fn({func: testFunc, retry: 2, out: out})
    const result = funky();
    assert.strictEqual(out.fn.countErrorsTotal, 1);
    assert.strictEqual(result, 2);
});

test('sync retry sugar syntax', (t) => {
    let i = 0;
    function testFunc() {
        i++;
        if (i == 1) {
            throw new Error('test sugar syntax retry');
        }
        return i;
    }
    const funky = fn({ func: testFunc, retry: 2 });
    assert.strictEqual(funky(), 2);
});




test('async retry sugar', async (t) => {
    let i = 0;

    async function testFunc() {
        i++;
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (i == 1) {
                    return reject(new Error('test async retry'));
                }
                resolve(i++);
            }, 100);
        });
    }


    const funky = fn({ func: testFunc, retry: 2 });
    assert.strictEqual(await funky(), 2);


});

test('refresh', (t, done) => {
    let i = 0;
    function testFunc() {
        return i++;
    }
    const out = {};
    const fnCached = fn({func: testFunc, refreshInterval: 1, out});
    assert.strictEqual(fnCached(), 0);
    assert.strictEqual(fnCached(), 0);
    setTimeout(() => {
        assert.strictEqual(fnCached(), 2);
        out.fn.clearInterval();
        done();
    }, 3000);

});

test('refresh sugar', (t, done) => {
    let i = 0;
    function testFunc() {
        return i++;
    }
    const out = {};
    const fnCached = fn({ func: testFunc, ttl: 1, refreshInterval: 1, out });
    assert.strictEqual(fnCached(), 0);
    assert.strictEqual(fnCached(), 0);
    setTimeout(() => {
        assert.strictEqual(fnCached(), 2);
        out.fn.clearInterval();
        done();
    }, 3000);
});

test('cache', (t, done) => {
    let i = 0;
    function testFunc() {
        return i++;
    }
    const fnCached = fn({func: testFunc, ttl: 1});
    assert.strictEqual(fnCached(), 0);
    assert.strictEqual(fnCached(), 0);
    setTimeout(() => {
        assert.strictEqual(fnCached(), 1);
        done();
    }, 1000);

});

test('cache sugar', (t, done) => {
    let i = 0;
    function testFunc() {
        return i++;
    }
    const fnCached = fn({ func: testFunc, ttl: 1 });
    assert.strictEqual(fnCached(), 0);
    assert.strictEqual(fnCached(), 0);
    setTimeout(() => {
        assert.strictEqual(fnCached(), 1);
        done();
    }, 1200);

});


test('async cache', async (t) => {
    let i = 0;
    async function testFunc() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(i++);
            }, 100);
        });
    }
    const fnCached = fn({func:testFunc, ttl: 1});
    assert.strictEqual(await fnCached(), 0);
    assert.strictEqual(await fnCached(), 0);
    return new Promise((resolve) => {
        setTimeout(async () => {
            assert.strictEqual(await fnCached(), 1);
            resolve();
        }, 1000);
    });

});
