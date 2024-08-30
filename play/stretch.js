
'use strict';

const cpugraph = require('../');

const T = cpugraph.tree.build();

T.i = cpugraph.tree.input;
T.m = t => t.i + 10;

T.s = new cpugraph.StretchNode({maxNode: T.m});

const t = cpugraph.tree.unwrap(T);

t.i = 5;
t.s = 12;

console.log( 0+t.s );

t.i = 1;

console.log( 0+t.s );

t.i = 6;

console.log( 0+t.s );
