
'use strict';

const {NODE, nodeOf} = require('../');
const {build, unwrap, input} = require('../tree');
const {Universe} = require('../universe');

function mapXlateFwd(dx, dy, pt) { return {x: pt.x+dx, y: pt.y+dy} }
function mapXlateRev(dx, dy, pt) { return {x: pt.x-dx, y: pt.y-dy} }

function main () {
    const U = new Universe();

    var dx = U.addInput({});
    var dy = U.addInput({});
    var pt = U.addInput({}); // point
    
    pt.value = {x:10, y:10};
    dx.value = 1;
    dy.value = 5;
    var dx2 = U.addCompute({
        bind: [dx],
        func: dx => dx*10
    });
    var dy2 = U.addCompute({
        bind: [dy],
        func: dy => dy*10
    });
    
    U.registerMap('xlate',
        (dxNode, dyNode) => U.mapSplit(mapXlateFwd, mapXlateRev, [dxNode,dyNode])
    )
    // TODO:
    // notice: no 'u' argument to the passed in func
    /*
    U.map.xlate = (dxNode, dyNode) => 
        U.mapSplit(mapXlateFwd, mapXlateRev, [dxNode,dyNode])
    */
    
    //var dp = U.mapSplit(mapXlateFwd, mapXlateRev, [dx,dy]).mapNode( pt );
    //var dp2 = U.mapSplit(mapXlateFwd, mapXlateRev, [dx2,dy2]).mapNode( dp );

    //var dp  = U.map.xlate(dx , dy ).mapNode( pt );
    //var dp2 = U.map.xlate(dx2, dy2).mapNode( dp );
    
    var dp  = pt.map.xlate(dx , dy );
    var dp2 = dp.map.xlate(dx2, dy2);
    
    console.log( `pt: ${pt.value.x},${pt.value.y}` );
    console.log( `dx: ${0+dx.value} dy: ${0+dy.value}` );
    console.log( `dp: ${dp.value.x}, ${dp.value.y}` );    

    console.log( `dx2: ${0+dx2.value} dy2: ${0+dy2.value}` );
    console.log( `dp2: ${dp2.value.x}, ${dp2.value.y}` );    
    
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
