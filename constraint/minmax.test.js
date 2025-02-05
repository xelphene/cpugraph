
'use strict';

const ensure = require('./ensure');
const {Universe, unwrap, nodeOf} = require('../');

beforeEach(() => { global.console = require('console'); });

function getTree(ensures)
{
    const universe = new Universe();
    return universe.defineObj( (T,F) => {

    ////////////////////////////////

    T.ia = F.input(32);
    T.ib = F.input(80);

    if( ensures.includes('input') )
        ensure.rel( T.ia, '<=', T.ib );

    T.ca = t => t.ia + 10;
    T.cb = t => t.ib - 10;
    
    if( ensures.includes('compute') )
        ensure.rel( T.ca, '<=', T.cb );

    universe.registerMap('x10', v => v*10, v => v/10 );
    T.ma = T.ca.map.x10( T.ca );
    T.mb = T.cb.map.x10( T.cb );
    if( ensures.includes('map') )
        ensure.rel( T.ma, '<=', T.mb );
    
    //////////////////////////////////

    });
}

function getReadyTree (ensures) {
    var t = getTree(ensures)
    return t;
}

test('set ia > ib so input constraint is violated', () =>
{
    const t = getReadyTree(['input','compute']);

    expect( 0+t.ia ).toBe( 32 )
    expect( 0+t.ib ).toBe( 80 )

    expect( () => {t.ia = 99} ).toThrow("Constraint Violation: ia 99 <= 80 ib")

    t.ia = 34;
    
    expect( 0+t.ia ).toBe( 34 );
    expect( 0+t.ib ).toBe( 80 );

});

test('set ia so compute nodes violate', () =>
{
    const t = getReadyTree(['input','compute']);
    
    expect( 0+t.ia ).toBe( 32 )
    expect( 0+t.ib ).toBe( 80 )
    
    expect( () => { t.ib=51 } ).toThrow("Constraint Violation: ca 42 <= 41 cb")

    t.ib = 53;
    
    expect( 0+t.ca ).toBe( 42 );
    expect( 0+t.cb ).toBe( 43 );
});


test('set ia > ib so map constraint is violated', () =>
{
    const t = getReadyTree(['map']);

    expect( 0+t.ia ).toBe( 32 )
    expect( 0+t.ib ).toBe( 80 )
    
    expect( () => {t.ia=99} ).toThrow("Constraint Violation: ma 1090 <= 700 mb")
    
    t.ia = 34
    
    expect( 0+t.ia ).toBe( 34 );
    expect( 0+t.ib ).toBe( 80 );
});
