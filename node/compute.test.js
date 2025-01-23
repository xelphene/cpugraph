
'use strict';

const {createNodeObj, ComputeNode, NODE} = require('../');

beforeEach( () => {
    global.console = require('console');
});

test('basic', () => 
{
    //var t = {};
    var t = createNodeObj();

    t.a = new ComputeNode({
        bind: [],
        func: () => 1,
        debugName: 'a'
    });

    var b = new ComputeNode({
        func: () => 10,
    });
    b.debugName = 'b'

    t.b2 = new ComputeNode({
        bind: [t.a],
        func: a => a+1,
        debugName: 'b2'
    });

    var w = new ComputeNode({
        func: () => 0.1,
        debugName: 'w',
    });
    Object.defineProperty( t, 'w', {
        get: () => w.value
    });
    
    var x = new ComputeNode({
        bind: [t],
        func: t => t.a+1,
        debugName: 'x'
    });
    Object.defineProperty( t, 'x', {
        get: () => x.value
    });

    var c = new ComputeNode({
        bind: [t, b],
        func: (t,b) => t.a + b + t.b2 + t.w,
        debugName: 'c'
    });

    expect( t.a.debugName ).toBe( 'a' );
    expect( b.debugName ).toBe( 'b' );
    expect( 0+c.value ).toBe( 13.1 );
    expect( 0+t.w ).toBe( 0.1 );
    expect( 0+t.x ).toBe( 2 );
    expect( t.w[NODE] ).toBe( w );
    expect( t.x[NODE] ).toBe( x );
});

