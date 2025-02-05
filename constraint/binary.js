
'use strict';

const {Constraint} = require('./base');

class BinaryConstraint extends Constraint {
    constructor({nodeA, op, nodeB}) {
        super({});

        if( this.validOps.includes(op) )
            this.op = op
        else
            throw new Error(`invalid value ${op} for op`);

        this.nodeA = nodeA;
        this.nodeB = nodeB;
    }
    
    get validOps () { return [] }
    
    otherNode(node) {
        if( node===this.nodeA )
            return this.nodeB
        else if( node===this.nodeB )
            return this.nodeA
        else
            throw new Error(`unknown value ${node} for node arg`)
    }
    
    appliesToNode(node) {
        return node===this.nodeA || node===this.nodeB
    }

    toString () {
        return `${this.nodeA.debugName} ${this.op} ${this.nodeB.debugName}`;
    }
    
    toStringWithValues () {
        return `${this.nodeA.debugName} ${this.nodeA.constraintCheckValue} ${this.op} ${this.nodeB.constraintCheckValue} ${this.nodeB.debugName}`;
    }
    
    get nodes () { return [this.nodeA, this.nodeB] }
}
exports.BinaryConstraint = BinaryConstraint;
