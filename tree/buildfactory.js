
'use strict';

const {subobj} = require('../consts');
const {AsIs, createNodeObj} = require('./nodeobj');
const {isNode, nodeOf} = require('../node/util');

class BuildFactory {
    constructor(universe, bindings) {
        this.universe = universe;
        this.bindings = bindings;
    }
    
    input (initValue) {
        return this.universe.addInput({value:initValue});
    }
    
    asIs (v) {
        return new AsIs(v);
    }
    
    subobj () {
        return createNodeObj(this.universe);
    }

    defineObj () {
        return this.universe.defineObj(...arguments);
    }
    
    _getBindFuncArgs () {
        const args = [];
        
        for( let b of this.bindings ) {
            if( isNode(b) )
                args.push( nodeOf(b).value )
            else
                args.push(b)
        }
        
        return args;
    }
    
    bindFunc (origFunc) {
        const outerThis = this;
        return new AsIs( function () {
            const args = outerThis._getBindFuncArgs().concat([...arguments]);
            return origFunc.apply(this, args);
        });
    }
    
    node (func) {
        return this.universe.addCompute({
            bind: this.bindings,
            func
        })
    }
}
exports.BuildFactory = BuildFactory;
