
'use strict';

const {BinaryConstraint} = require('./binary');
const {Constraint} = require('./base');
const {Node} = require('../node/node');

class LtEq extends BinaryConstraint {
    static get opStr () { return '<=' }
    
    check () {
        return this.nodeA.constraintCheckValue <= this.nodeB.constraintCheckValue
    }
    
    getBoundaryForNode(node) {
        if( node===this.nodeA ) {
            return ['max', this.nodeB.value];
        } else {
            return ['min', this.nodeA.value];
        }
    }
}
exports.LtEq = LtEq;

class GtEq extends BinaryConstraint {
    static get opStr () { return '>=' }
    
    check () {
        return this.nodeA.constraintCheckValue >= this.nodeB.constraintCheckValue
    }

    getBoundaryForNode(node) {
        if( node===this.nodeA ) {
            return ['min', this.nodeB.value];
        } else {
            return ['max', this.nodeA.value];
        }
    }
}
exports.GtEq = GtEq;

const cClasses = [LtEq, GtEq];

function ensureNum(nodeA, op, nodeB) {
    for( let cls of cClasses ) {
        if( cls.matchesEnsure([...arguments]) ) {
            //console.log(arguments);
            const c = cls.ensure(...arguments);
            return c
        }
    }
    throw new Error(`No applicable Constraint class`);
}
exports.ensureNum = ensureNum;
