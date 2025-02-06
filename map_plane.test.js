
'use strict';

const {Universe, NODEOBJ} = require('./');
const {getRegMapObj} = require('./map_plane');

test('basic flat map_plane', () => {
    const U = new Universe();
    U.registerMap( 'negate', x => -x, x => -x );

    const t = U.defineObj( (T,F) => {
        
        [T.p, T.n] = getRegMapObj(U, U.map.negate() ); // redundant
        
        T.p.i = F.input( 11 );
        T.p.a = t => t.p.i+1
        T.n.b = t => -20
    });
    
    //t[NODEOBJ].log()
    
    expect( 0+t.p.i ).toBe( 11 );
    expect( 0+t.p.a ).toBe( 12 );
    expect( 0+t.p.b ).toBe( 20 );
    expect( 0+t.n.a ).toBe( -12 );
    expect( 0+t.n.b ).toBe( -20 );
    
    //console.log(`-- set i = 111`);
    t.p.i = 111;

    expect( 0+t.p.i ).toBe( 111 );
    expect( 0+t.p.a ).toBe( 112 );
    expect( 0+t.p.b ).toBe( 20 );
    expect( 0+t.n.i ).toBe( -111 );
    expect( 0+t.n.a ).toBe( -112 );
    expect( 0+t.n.b ).toBe( -20 );

    //console.log(`-- set i = -1111`);

    t.n.i = -1111;
    //t[NODEOBJ].log()

    expect( 0+t.p.i ).toBe( 1111 );
    expect( 0+t.p.a ).toBe( 1112 );
    expect( 0+t.p.b ).toBe( 20 );
    expect( 0+t.n.i ).toBe( -1111 );
    expect( 0+t.n.a ).toBe( -1112 );
    expect( 0+t.n.b ).toBe( -20 );

});
