
'use strict';

const {ComputeNode} = require('./compute');
const {InputNode} = require('./input');
const {StretchNode} = require('./stretch');

beforeEach( () => {
    global.console = require('console');
});

test('depvary', () =>
{
    var t = {};
    
    var i1 = new InputNode({debugName: 'i1'});
    
    t.i2 = new InputNode({});
    t.i2.debugName = 'i2';
    
    t.mode = new InputNode({debugName:'mode'});
    
    //t.c = new ComputeNode( (i, t) => t.i2 + i,  [i1, t] );
    t.c = new ComputeNode({
        bind: [i1, t],
        func: (i, t) => {
            if( t.mode=='inc' )
                return i + 1;
            else
                return i + t.i2
        },
        debugName: 'c',
    });

    i1.value = 1;
    t.i2.value = 10;
    t.mode.value = 'inc';

    expect( i1.debugName ).toBe( 'i1' );
    expect( t.i2.debugName ).toBe( 'i2' );
    expect( 0 + t.c.value ).toBe( 2 );
    expect( t.c.deps ).toContain( i1 );
    expect( t.c.deps ).toContain( t.mode );
    expect( t.c.deps ).not.toContain( t.i2 );
    expect( t.c.fresh ).toBe( true );
    expect( t.c.computeCount ).toBe( 1 );

    // changing irrelevant node should change nothing about t.c
    t.i2.value = 999;

    expect( t.c.fresh ).toBe( true );
    expect( 0 + t.c.value ).toBe( 2 );
    expect( t.c.computeCount ).toBe( 1 );
    expect( t.c.deps ).toContain( i1 );
    expect( t.c.deps ).toContain( t.mode );
    expect( t.c.deps ).not.toContain( t.i2 );
    
    //console.log(`changing inputs...`);
    t.mode.value = 'add';
    t.i2.value = 100;
    
    expect( t.c.fresh ).toBe( false );
    expect( 0+t.c.value ).toBe( 101 );
    expect( t.c.fresh ).toBe( true );
    expect( t.c.computeCount ).toBe( 2 );

    expect( t.c.deps ).toContain( i1 );
    expect( t.c.deps ).toContain( t.mode );
    expect( t.c.deps ).toContain( t.i2 );
});

test('nest', () =>
{
    var t = {};
    t.s = {};

    t.i = new InputNode({});
    t.i.debugName = 't.i';

    t.s.x = new ComputeNode({
        func: () => 222
    });
    t.s.x.debugName = 't.s.x';

    t.c = new ComputeNode({
        bind: [t],
        func: t => t.s.x + t.i,
        debugName: 'c'
    });

    t.i.value = 0.1;
    
    expect( 0+t.c.value ).toBe( 222.1 );
    expect( t.c.deps ).toContain( t.s.x );
    expect( t.c.deps ).toContain( t.i );
});

test('stretch', () =>
{
    const t = {};
    
    t.i = new InputNode({});
    t.m = new ComputeNode({
        bind: [t],
        func: t => t.i + 10
    });
    t.s = new StretchNode({
        maxNode: t.m
    });

    t.i.value = 5;
    t.s.value = 12;

    expect( 0+t.s.value ).toBe( 12 );
    t.i.value = 1;
    expect( 0+t.s.value ).toBe( 11 );
    t.i.value = 6;
    expect( 0+t.s.value ).toBe( 12 );

});
