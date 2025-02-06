
'use strict';

const {Universe, NODEOBJ} = require('../');
const {getRegMapObj} = require('../map_plane');

function main () {
    const U = new Universe();
    U.registerMap( 'negate', x => -x, x => -x );

    const t = U.defineObj( (T,F) => {
        
        [T.p, T.n] = getRegMapObj(U, U.map.negate() ); // redundant
        
        T.p.i = F.input( 11 );
        T.p.a = t => t.p.i+1
        T.n.b = t => -20
    });
    
    console.log( 0+t.p.a );
    console.log( 0+t.n.a );
    console.log( 0+t.p.b );
    console.log( 0+t.n.b );
    
    t[NODEOBJ].log()
    
    console.log(`-- set i = 111`);
    
    t.p.i = 111;
    t[NODEOBJ].log()

    console.log(`-- set i = -1111`);

    t.n.i = -1111;
    t[NODEOBJ].log()
}

if( require.main === module )
    main();
