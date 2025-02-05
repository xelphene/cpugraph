
'use strict';

const {NODE, nodeOf} = require('../');
const {build, unwrap, input} = require('../tree');
const {Universe} = require('../universe');

function mapXlateFwd(dx, dy, pt) { return {x: pt.x+dx, y: pt.y+dy} }
function mapXlateRev(dx, dy, pt) { return {x: pt.x-dx, y: pt.y-dy} }

function main () {
    const U = new Universe();

    var ptA = U.addCompute({ func: () => ({x:1, y:1}) });
    var ptB = U.addCompute({ func: () => ({x:2, y:2}) });
    var ptC = U.addCompute({ func: () => ({x:3, y:3}) });
    
    var dx1 = U.addInput({});
    var dy1 = U.addInput({});
    dx1.value = 1;
    dy1.value = 1;

    var dx2 = U.addInput({});
    var dy2 = U.addInput({});
    dx2.value = 10;
    dy2.value = 10;
    
    U.registerMap('xlate', mapXlateFwd, mapXlateRev);
    
    var mA  = ptA.map.xlate( dx1, dy1  );
    var mAA = mA.map.xlate(  dx2, dy2 );
    var mB  = ptB.map.xlate( dx1, dy1  );
    var mBB = mB.map.xlate(  dx2, dy2 );
    var mC  = ptC.map.xlate( dx1, dy1 );
    
    console.log( `mA:  ${mA.value.x}, ${mA.value.y}` );
    console.log( `mAA: ${mAA.value.x}, ${mAA.value.y}` );
    console.log( `mB:  ${mB.value.x}, ${mB.value.y}` );
    console.log( `mBB: ${mBB.value.x}, ${mBB.value.y}` );

    if( mA.mapper.hasMapForSrc(ptB) ) {
        console.log(`mA's mapper has a map for ptB`);
        console.log( mA.mapper.existingMapNode(ptB) === mB )
        console.log( mA.mapper.existingMapNode(ptB).value )
    }
    if( mAA.mapper.hasMapForSrc(mB) ) {
        console.log(`mAA's mapper has a map for mB`);
        console.log( mAA.mapper.existingMapNode(mB) === mBB )
        console.log( mAA.mapper.existingMapNode(mB).value )
    }

    return;
        
    console.log( '-- set dx=2');
    dx.value = 2;

    console.log( `pt: ${pt.value.x}, ${pt.value.y}` );    
    console.log( `dx: ${0+dx.value} dy: ${0+dy.value}` );
    console.log( `dp: ${dp.value.x}, ${dp.value.y}` );    
    console.log( `dx2: ${0+dx2.value} dy2: ${0+dy2.value}` );
    console.log( `dp2: ${dp2.value.x}, ${dp2.value.y}` );    

    console.log( '-- set dp = 20,20');
    dp.value = {x:20, y:20};

    console.log( `dp: ${dp.value.x}, ${dp.value.y}` );    
    console.log( `dx: ${0+dx.value} dy: ${0+dy.value}` );
    console.log( `pt: ${pt.value.x}, ${pt.value.y}` );    
    console.log( `dx2: ${0+dx2.value} dy2: ${0+dy2.value}` );
    console.log( `dp2: ${dp2.value.x}, ${dp2.value.y}` );    
    
    console.log('=== dp2.mapValueToSrc(200,100) ===');
    console.log( `dx: ${0+dx.value} dy: ${0+dy.value}` );
    console.log( `dx2: ${0+dx2.value} dy2: ${0+dy2.value}` );
    
    console.log( dp2.mapValueToSrc( {x:200,y:100} ) )
    console.log( dp2.mapValueToSrc( {x:200,y:100}, pt ) )
    console.log( dp2.mapValueToSrc( {x:200,y:100}, dp ) )
    console.log( dp2.mapValueToSrc( {x:200,y:100}, dp2 ) )
}

if( require.main === module )
    main();
