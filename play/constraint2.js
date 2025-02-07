
'use strict';

const {ensure, Ensurer} = require('../constraint/ensure');
const {Universe, unwrap, nodeOf} = require('../');
const {LtEq, GtEq} = require('../constraint/minmax');
//const {BindFuncConstraint} = require('../constraint/bindfunc');
const {ensureNum} = require('../constraint/minmax');
const {ensureFunc} = require('../constraint/bindfunc');

function getTree(universe, ensures)
{
    const e = new Ensurer();
    //e.registerConstraint(LtEq);
    //e.registerConstraint(GtEq);
    //e.registerConstraint(BindFuncConstraint);

    return universe.defineObj( (T,F) => {

    ////////////////////////////////

    T.ia = F.input(32);
    T.ib = F.input(80);

    if( ensures.includes('input') ) {
        ensureNum( T.ia, '<=', T.ib );
        //let cc = e.ensure( T.ia, '<=', T.ib );
    }

    T.ca = t => t.ia + 10;
    T.cb = t => t.ib - 10;

    //e.ensure( [T.ca], ca => ca<41 );
    ensureFunc( [T.ca], ca => ca!= 40 );
    
    if( ensures.includes('compute') )
        ensureNum( T.ca, '<=', T.cb );
        //e.ensure( T.ca, '<=', T.cb );

    universe.registerMap('x10', v => v*10, v => v/10 );
    T.ma = T.ca.map.x10( T.ca );
    T.mb = T.cb.map.x10( T.cb );
    if( ensures.includes('map') )
        ensureNum( T.ma, '<=', T.mb );
        //e.ensure( T.ma, '<=', T.mb );
    
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
    
    t.ia = 30;
    console.log( t.ca );

    for( let n of universe.nodes ) {
        console.log(`*: ${n.debugName}  ${n.constraintCheckValue}`);
        for( let c of n.iterConstraints() )
            console.log(`   -: ${c}  ${c.check()}`);
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
