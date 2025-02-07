
'use strict';

const {ensure} = require('../constraint/ensure');
const {Universe, unwrap, nodeOf} = require('../');
const {LtEq, GtEq} = require('../constraint/minmax');

function getTree(universe, ensures)
{
    return universe.defineObj( (T,F) => {

    ////////////////////////////////

    T.ia = F.input(32);
    T.ib = F.input(80);

    if( ensures.includes('input') )
        //ensure( T.ia, '<=', T.ib );
        ensure( T.ia, LtEq, T.ib );

    T.ca = t => t.ia + 10;
    T.cb = t => t.ib - 10;
    
    if( ensures.includes('compute') )
        //ensure.rel( T.ca, '<=', T.cb );
        ensure( T.ca, LtEq, T.cb );

    universe.registerMap('x10', v => v*10, v => v/10 );
    T.ma = T.ca.map.x10( T.ca );
    T.mb = T.cb.map.x10( T.cb );
    if( ensures.includes('map') )
        //ensure.rel( T.ma, '<=', T.mb );
        ensure( T.ma, LtEq, T.mb );
    
    //////////////////////////////////

    });
}

function getReadyTree (universe, ensures) {
    var t = getTree(universe, ensures)
    return t;
}

function main () 
{
    const universe = new Universe();
    const t = getReadyTree(universe, ['input','compute']);

    console.log('=========================');
    
    for( let n of universe.nodes ) {
        console.log(`*: ${n.debugName}  ${n.constraintCheckValue}`);
        for( let c of n.iterConstraints() )
            console.log(`   -: ${c.debugName}  ${c.check()}`);
    }

    console.log('---');    
    console.log(`t.ca: ${t.ca}`);

    console.log('=========================');

    t.ia = 65;

    for( let n of universe.nodes ) {
        console.log(`*: ${n.debugName}  ${n.constraintCheckValue}`);
        for( let c of n.iterConstraints() )
            console.log(`   -: ${c.debugName}  ${c.check()}`);
    }
    
    console.log('---');    
    console.log(`t.ca: ${t.ca}`);
}

if( require.main === module )
    main();
