
'use strict';

const {ComputeNode, InputNode, NODE} = require('../');
const {build, unwrap, input} = require('../tree');

beforeEach( () => {
    global.console = require('console');
});

test('depvary', () =>
{
    var T = build();
    
    T.i1 = input;
    T.i2 = input;
    T.mode = input;

    T.c = t => {
        if( t.mode=='inc' )
            return t.i1 + 1;
        else
            return t.i1 + t.i2
    };
    T = unwrap(T);

    T.i1 = 1;
    T.i2 = 10;
    T.mode = 'inc';
    
    // these checks are done with this cNode ref instead of T.c[NODE]
    // because the get op for T.c immediately causes a recompute
    const cNode = T.c[NODE];

    expect( 0 + T.c ).toBe( 2 );
    
    expect( T.c[NODE].hearingFromNodes ).toContain( T.i1[NODE] );
    expect( T.c[NODE].hearingFromNodes ).toContain( T.mode[NODE] );
    expect( T.c[NODE].hearingFromNodes ).not.toContain( T.i2[NODE] );
    expect( T.c[NODE].fresh ).toBe( true );
    expect( T.c[NODE].computeCount ).toBe( 1 );

    // changing irrelevant node should change nothing about t.c
    T.i2 = 999;

    expect( T.c[NODE].fresh ).toBe( true );
    expect( 0 + T.c ).toBe( 2 );
    expect( T.c[NODE].computeCount ).toBe( 1 );
    expect( T.c[NODE].hearingFromNodes ).toContain( T.i1[NODE] );
    expect( T.c[NODE].hearingFromNodes ).toContain( T.mode[NODE] );
    expect( T.c[NODE].hearingFromNodes ).not.toContain( T.i2[NODE] );
    
    T.mode = 'add';
    T.i2 = 100;
    
    expect( cNode.fresh ).toBe( false );
    expect( 0+T.c ).toBe( 101 );
    expect( T.c[NODE].fresh ).toBe( true );
    expect( T.c[NODE].computeCount ).toBe( 2 );

    expect( T.c[NODE].hearingFromNodes ).toContain( T.i1[NODE] );
    expect( T.c[NODE].hearingFromNodes ).toContain( T.mode[NODE] );
    expect( T.c[NODE].hearingFromNodes ).toContain( T.i2[NODE] );
    
});

test('rebuild', () =>
{
    var T = build();
        
    T.i = input;
    T.j = input;
    T.c = t => t.i + t.j;
    T.d = t => t.i * 2;
    T = unwrap(T);
    
    T.i = 10;
    T.j = 20;

    expect( 0+T.c ).toBe( 30 );
    expect( 0+T.d ).toBe( 20 );
    
    T.setIJ = function (newI, newJ) {
        this.i = newI;
        this.j = newJ;
    }
    
    T = build(T);
    T.z = t => t.j - t.i;
    T = unwrap(T);
    
    T.setIJ(1,2);
    expect( 0+T.c ).toBe( 3 );
    expect( 0+T.z ).toBe( 1 );
});


test('nest', () =>
{
    var t = {};
    t.s = {};

    t.i = new InputNode({});
    t.i.debugName = 't.i';

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
    
    expect( 0+t.c.value ).toBe( 222.1 );
    expect( t.c.hearingFromNodes ).toContain( t.s.x );
    expect( t.c.hearingFromNodes ).toContain( t.i );
});

