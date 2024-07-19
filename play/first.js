
'use strict';

const {ComputeNode} = require('../');

var t = {};

t.a = new ComputeNode( () => 1, [] );
t.a.debugName = 'a';

var b   = new ComputeNode( () => 10, [] );
b.debugName = 'b';

t.b2 = new ComputeNode( a => a+1, [t.a] );
t.b2.debugName = 'b2';

var w = new ComputeNode( () => 0.1, [] );
w.debugName = 'w';
Object.defineProperty( t, 'w', {
    get: () => w.value
});

var c = new ComputeNode( (t,b) => t.a + b + t.b2 + t.w, [t, b]);
c.debugName = 'c';

console.log('---');
console.log(0+c.value);
console.log(0 + t.w );
console.log(c.depsDebugNames);
console.log(t.b2.depsDebugNames);
