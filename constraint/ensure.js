
'use strict';

const {Constraint} = require('./base');
const {BindFuncConstraint} = require('./bindfunc');
const {MinMaxConstraint} = require('./minmax');
const {isNode, unwrap} = require('../');

exports.bindFunc = function( bindings, func, desc ) {
}

exports.rel = function( nodeA, op, nodeB ) {

    nodeA = unwrap(nodeA);
    nodeB = unwrap(nodeB);
    
    const c = new MinMaxConstraint({
        nodeA, op, nodeB
    });
    
    nodeA.addConstraint(c);
    nodeB.addConstraint(c);
}

exports.ensure = function () {
    var c;
    var nodes = [];
    for( let a of arguments ) {
        if( a.prototype instanceof Constraint ) {
            if( c !== undefined )
                throw new Error(`ensure() called with multiple Constraint classes`);
            c = a
        } else if( isNode(a) ) {
            nodes.push( unwrap(a) );
        } else
            throw new Error(`ensure() passed unknown argument ${arguments.indexOf(a)}`);
    }
    c = new c({nodes});
    for( let n of nodes )
        n.addConstraint(c);
    return c;
}

// Ensurer is a factory for Constraints
// it builds the Constraint and associates it with Nodes
// it makes sure that it doesn't make duplicate constraints
class Ensurer {
    constructor () {
        this._cClasses = [];
        this._cs = [];
    }
    
    registerConstraint (cls) {
        if( ! (cls.prototype instanceof Constraint) )
            throw new TypeError(cls)
        this._cClasses.push(cls);
    }

    // calling forms:
    //  ensure( [Nodes], function )
    //  ensure( Node, string, Node )
    //  ensure( Node, BinaryConstraint, Node )
    ensure () {
        for( let cls of this._cClasses ) {
            if( cls.matchesEnsure([...arguments]) ) {
                //console.log(arguments);
                const c = cls.ensure(...arguments);
                this._cs.push( c );
                return c
            }
        }
        throw new Error(`No applicable Constraint class`);
    }
}
exports.Ensurer = Ensurer;
