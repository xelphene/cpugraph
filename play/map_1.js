
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
    
    var dp = U.mapSplit(mapXlateFwd, mapXlateRev, [dx,dy]).mapNode( pt );
    
    console.log( pt.value );
    console.log( 0+dx.value );
    console.log( 0+dy.value );
    
    console.log( `dp: ${dp.value.x}, ${dp.value.y}` );    
    
    dx.value = 2;

    console.log( `dp: ${dp.value.x}, ${dp.value.y}` );    
}

if( require.main === module )
    main();
