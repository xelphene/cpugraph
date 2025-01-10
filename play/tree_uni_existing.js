
'use strict';

const {NODE, nodeOf} = require('../');
const {build, unwrap, input} = require('../tree');
const {Universe} = require('../universe');
const {InputNode, ComputeNode} = require('../');

function main ()
{
    const u = new Universe();
    
    const T = u.defineObj( T => {
        T.i = input;
        T.j = input;
        
        T.c = t => t.i + t.j;
        T.d = t => t.i * 2;
        
    });


    T.i = 10;
    T.j = 20;
    
    T.setIJ = function (newI, newJ) {
        this.i = newI;
        this.j = newJ;
    }
    
    u.defineObj( T, T => {
        T.z = t => t.j - t.i;
    });
    
    console.log( 0+T.c ); // 30
    console.log( 0+T.d ); // 20
    
    console.log('--- change input t.j');
    
    T.j = 200;
    console.log( 0+T.c ); // 210
    
    //console.log( T );
    console.log( nodeOf(T.c).debugName ); // c
    
    console.log('--- setIJ ---');
    T.setIJ(1,2);
    console.log( 0+T.c ); // 3
    console.log( 0+T.z ); // 1


}

if( require.main === module )
    main();
