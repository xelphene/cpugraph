
'use strict';

const {Universe, input, subobj, asIs, NODEOBJ} = require('../');

function main () {
    const U = new Universe();
    
    const t = U.defineObj( T => {
        T.i = input
        T.j = input
        T.s = t => t.i+t.j
        
        T.setI = asIs( function(v) {
            console.log(`in some asIs function. this.s = ${this.s}`);
            this.i = v;
        });
        
        T.nah = t => t.setI(-777);
        
        T.sub = U.defineObj( S => {
            S.s = () => 222
        })
        
        T.sub2 = U.defineObjOpt(null, [T], S2 => {
            S2.s = t => t.i * t.j
        });
        
        T.sub3 = subobj
        T.sub3.s = t => t.i * t.j * 10
    })
    
    t.i = 1;
    t.j = 2;
    
    console.log( 0+t.s ); // 3
    
    console.log( t[NODEOBJ].computeFuncKeys );
    
    // console.log( 0+t.nah ); // Attempt to access key setI whose value is neither a Node nor a NodeObj

    t.setI( 100 );
    console.log( 0+t.s ); // 102
    
    console.log( 0+t.sub.s );
    console.log( 0+t.sub2.s ); // 200
    console.log( 0+t.sub3.s ); // 200
}

if( require.main === module )
    main();
