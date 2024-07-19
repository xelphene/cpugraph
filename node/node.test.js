
'use strict';

const {ComputeNode, InputNode} = require('../');

beforeEach( () => {
    global.console = require('console');
});

test('depvary', () =>
{
    var t = {};
    
    var i1 = new InputNode();
    i1.debugName = 'i1';
    
    t.i2 = new InputNode();
    t.i2.debugName = 'i2';
    
    t.mode = new InputNode();
    t.mode.debugName = 'mode';
    
    //t.c = new ComputeNode( (i, t) => t.i2 + i,  [i1, t] );
    t.c = new ComputeNode(
        (i, t) => {
            if( t.mode=='inc' )
                return i + 1;
            else
                return i + t.i2
        },
        [i1, t]
    );
    t.c.debugName = 'c';

    i1.value = 1;
    t.i2.value = 10;
    t.mode.value = 'inc';

    expect( 0 + t.c.value ).toBe( 2 );
    expect( t.c.hearingFromNodes ).toContain( i1 );
    expect( t.c.hearingFromNodes ).toContain( t.mode );
    expect( t.c.hearingFromNodes ).not.toContain( t.i2 );
    expect( t.c.fresh ).toBe( true );
    expect( t.c.computeCount ).toBe( 1 );

    // changing irrelevant node should change nothing about t.c
    t.i2.value = 999;

    expect( t.c.fresh ).toBe( true );
    expect( 0 + t.c.value ).toBe( 2 );
    expect( t.c.computeCount ).toBe( 1 );
    expect( t.c.hearingFromNodes ).toContain( i1 );
    expect( t.c.hearingFromNodes ).toContain( t.mode );
    expect( t.c.hearingFromNodes ).not.toContain( t.i2 );
    
    //console.log(`changing inputs...`);
    t.mode.value = 'add';
    t.i2.value = 100;
    
    expect( t.c.fresh ).toBe( false );
    expect( 0+t.c.value ).toBe( 101 );
    expect( t.c.fresh ).toBe( true );
    expect( t.c.computeCount ).toBe( 2 );

    expect( t.c.hearingFromNodes ).toContain( i1 );
    expect( t.c.hearingFromNodes ).toContain( t.mode );
    expect( t.c.hearingFromNodes ).toContain( t.i2 );
});

test('nest', () =>
{
    var t = {};
    t.s = {};

    t.i = new InputNode();
    t.i.debugName = 't.i';

    t.s.x = new ComputeNode( () => 222, [] );
    t.s.x.debugName = 't.s.x';

    t.c = new ComputeNode( t => t.s.x + t.i, [t] );
    t.c.debugName = 'c';

    t.i.value = 0.1;
    
    expect( 0+t.c.value ).toBe( 222.1 );
    expect( t.c.hearingFromNodes ).toContain( t.s.x );
    expect( t.c.hearingFromNodes ).toContain( t.i );
});
