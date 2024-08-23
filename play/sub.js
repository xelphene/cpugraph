
'use strict';

const {ComputeNode, InputNode} = require('../');

var t = {};
t.s = {};

t.i = new InputNode({debugName:'t.i'});

t.s.x = new ComputeNode({
    func: () => 222,
    debugName: 't.s.x'
});

t.c = new ComputeNode({
    bind: [t],
    func: t => t.s.x + t.i,
    debugName: 'c'
});

t.i.value = 0.1;

console.log('---');

console.log(0 + t.c.value);
console.log( t.c.depsDebugNames );

