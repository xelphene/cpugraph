
'use strict';

const {nodeOf, nodeOfProp, Universe, input, subobj, asIs, NODEOBJ} = require('../');

function getSubTree (U, x, y) {
    return U.defineObj( T => {
        T.x = x
        T.y = y
        T.sc = t => (t.x+t.y)*2
    });
}

function main () {
    const U = new Universe();
    
    var setI_saw_j2_as = null;
    
    const t = U.defineObj( T => {
        T.i = input
        T.j = input
        T.s = t => t.i+t.j
        T.j2 = t => t.j*2
        
        T.setI = asIs( function(v) {
            //console.log(`in some asIs function. this.s = ${this.s}`);
            setI_saw_j2_as = this.j2;
            this.i = v;
        });
        
        T.sub3 = subobj
        T.sub3.s = t => t.i * t.j * 10
        
        T.subt = getSubTree(U, T.j, T.s)
        
        T.r = t => t.subt.sc + 1;
    })
    
    nodeOf(t.r).debugName = 't.r';
    t.i = 1;
    t.j = 2;
    
    console.log( 0+t.s ); // 3
    
    // console.log( 0+t.nah ); // Attempt to access key setI whose value is neither a Node nor a NodeObj

    console.log( `-- t.setI( 100 )`);
    t.setI( 100 );
    console.log( 0+t.s ); // 102
    console.log( 0+t.sub3.s ); // 2000

    console.log( '-- subtree');
    
    console.log( `t.j: ${t.j}`);
    console.log( `t.s: ${t.s}`);
    console.log( `t.r: ${t.r}` ); // 209
    
    console.log( `- set t.j = 3`);
    t.j = 3;
    console.log( `t.subt.sc: ${t.subt.sc}` ); // 212
    console.log( `t.r: ${t.r}` ); // 213
    
}

if( require.main === module )
    main();
