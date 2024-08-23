
'use strict';

const {ComputeNode, InputNode} = require('../');

var t = {};

var i1 = new InputNode({});
i1.debugName = 'i1';

t.i2 = new InputNode({});
t.i2.debugName = 'i2';

t.inc = new InputNode({});
t.inc.debugName = 'inc';

//t.c = new ComputeNode( (i, t) => t.i2 + i,  [i1, t] );
t.c = new ComputeNode({
    bind: [i1, t],
    func: (i, t) => {
        if( t.inc )
            return i + 1;
        else
            return i + t.i2
    },
    debugName: 'c'
});

i1.value = 1;
t.i2.value = 10;
t.inc.value = true;

console.log('---');

console.log(0 + t.c.value);
console.log( t.c.depsDebugNames );

console.log('---');

console.log(`t.c fresh? ${t.c.fresh}`);
console.log(`changing inputs...`);
t.inc.value = false;
t.i2.value = 100;
console.log(`t.c fresh? ${t.c.fresh}`);
console.log( 0 + t.c.value );
console.log( t.c.depsDebugNames );

