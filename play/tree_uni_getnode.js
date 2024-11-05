
'use strict';

const {NODE, nodeOf} = require('../');
const {build, unwrap, input} = require('../tree');
const {Universe} = require('../universe');
const {InputNode, ComputeNode} = require('../');

function main ()
{
    const u = new Universe();
    
    const ei = u.addInput({debugName:'ei', value:10});

    const ec = u.addCompute({
        bind: [ei],
        func: ei => 222 + ei,
        debugName: 'ec'
    })
    
    const ET = u.defineObj( ET => {
        ET.d = () => 300;
    });
    
    const T = u.defineObj( T => {
        T.i = input;
        T.ei = ei;
        T.ec = ec;
        T.et_d = ET.d;

        T.i.value = 100;

        // all should be true
        console.log( T.ei===ei );
        console.log( T.ec===ec );
        console.log( T.i instanceof InputNode );
        console.log( T.i.value == 100 );
        console.log( T.et_d instanceof ComputeNode );
        console.log( T.et_d.value == 300 );
    });

    console.log( 0+T.ei ); // 10
    console.log( 0+T.ec ); // 232
    console.log( 0+T.et_d ); // 300


}

if( require.main === module )
    main();
