
'use strict';

const {ComputeNode, InputNode} = require('../');

var t = {};
t.s = {};

t.i = new InputNode();
t.i.debugName = 't.i';

t.s.x = new ComputeNode( () => 222, [] );
t.s.x.debugName = 't.s.x';

t.c = new ComputeNode( t => t.s.x + t.i, [t] );
t.c.debugName = 'c';

t.i.value = 0.1;

console.log('---');

console.log(0 + t.c.value);
console.log( t.c.depsDebugNames );

