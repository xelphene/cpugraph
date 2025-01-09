
'use strict';

const {ComputeNode, InputNode, NODE} = require('../');
const {build, unwrap, input} = require('../tree');
const {Universe} = require('../universe');

beforeEach( () => {
    global.console = require('console');
});

test('depvary', () =>
{
    const U = new Universe();
    var T = U.defineTree();
    
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
    const U = new Universe();
    var T = U.defineTree();
        
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
    
    //T = build(T);
    T = U.defineTree(T);
    T.z = t => t.j - t.i;
    T = unwrap(T);
    
    T.setIJ(1,2);
    expect( 0+T.c ).toBe( 3 );
    expect( 0+T.z ).toBe( 1 );
});


test('nest', () =>
{
    const U = new Universe();

    var t = {};
    t.s = {};

    //t.i = new InputNode({universe});
    t.i = U.addInput({});
    t.i.debugName = 't.i';

    //t.s.x = new ComputeNode({
    t.s.x = U.addCompute({
        func: () => 222,
        debugName: 't.s.x'
    });

    //t.c = new ComputeNode({
    t.c = U.addCompute({
        bind: [t],
        func: t => t.s.x + t.i,
        debugName: 'c'
    });

    t.i.value = 0.1;
    
    expect( 0+t.c.value ).toBe( 222.1 );
    expect( t.c.hearingFromNodes ).toContain( t.s.x );
    expect( t.c.hearingFromNodes ).toContain( t.i );
});

test('assign_other', () =>
{
    const U = new Universe();
    //var ei = new InputNode({debugName:'ei'});
    var ei = U.addInput({debugName:'ei'});
    ei.value = 10;
    
    //var ec = new ComputeNode({
    var ec = U.addCompute({
        bind: [ei],
        func: ei => 222 + ei,
        debugName: 'ec'
    });

    //var ET = build();
    var ET = U.defineTree();
    ET.d = () => 300;

    //var T = build();
    var T = U.defineTree();
    
    T.ei = ei;
    T.ec = ec;
    T.et_d = ET.d;
    
    T = unwrap(T);
    
    expect( 0+T.ei ).toBe( 10 );
    expect( 0+T.ec ).toBe( 232 );
    expect( 0+T.et_d ).toBe( 300 );

});

test('node_back_ref', () =>
{
    const U = new Universe();
    //var ei = new InputNode({debugName:'ei'});
    var ei = U.addInput({debugName:'ei'});
    ei.value = 10;
    
    //var ec = new ComputeNode({
    var ec = U.addCompute({
        bind: [ei],
        func: ei => 222 + ei,
        debugName: 'ec'
    });

    //var ET = build();
    var ET = U.defineTree();
    ET.d = () => 300;

    //var T = build();
    var T = U.defineTree();
    
    T.i = input;
    T.ei = ei;
    T.ec = ec;
    T.et_d = ET.d;
    
    var t = unwrap(T);
    t.i = 100;
    
    expect( T.ei===ei ).toBe( true );
    expect( T.ec===ec ).toBe( true );
    expect( T.i instanceof InputNode ).toBe( true );
    expect( T.i.value == 100 ).toBe( true );
    expect( T.et_d instanceof ComputeNode ).toBe( true );
    expect( T.et_d.value == 300 ).toBe( true );

});
