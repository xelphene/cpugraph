
'use strict';

const {ComputeNode} = require('../');

var t = {};

t.a = new ComputeNode({
    bind: [],
    func: () => 1,
    debugName: 'a',
});

var b   = new ComputeNode({
    bind: [],
    func: () => 10
});
b.debugName = 'b';

t.b2 = new ComputeNode({
    bind: [t.a],
    func: a => a+1,
    debugName: 'b2'
});

var w = new ComputeNode({
    bind: [],
    func: () => 0.1,
    debugName: 'w'
});
Object.defineProperty( t, 'w', {
    get: () => w.value
});

var c = new ComputeNode({
    bind: [t,b],
    func: (t,b) => t.a + b + t.b2 + t.w,
    debugName: 'c'
});

console.log('---');
console.log(0+c.value);
console.log(0 + t.w );
console.log(c.depsDebugNames);
console.log(t.b2.depsDebugNames);
