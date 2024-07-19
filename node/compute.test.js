
'use strict';

const {ComputeNode, NODE} = require('../');

beforeEach( () => {
    global.console = require('console');
});

test('basic', () => 
{
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
    
    var x = new ComputeNode( t => t.a+1, [t] );
    x.debugName = 'x';
    Object.defineProperty( t, 'x', {
        get: () => x.value
    });

    var c = new ComputeNode( (t,b) => t.a + b + t.b2 + t.w, [t, b]);
    c.debugName = 'c';

    expect( 0+c.value ).toBe( 13.1 );
    expect( 0+t.w ).toBe( 0.1 );
    expect( 0+t.x ).toBe( 2 );
    expect( t.w[NODE] ).toBe( w );
    expect( t.x[NODE] ).toBe( x );
});

