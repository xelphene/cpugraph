
'use strict';

const {Node} = require('../node/node');
const {Constraint} = require('./base');

class BinaryConstraint extends Constraint {
    constructor(nodeA, nodeB) {
        super({});
        this.nodeA = nodeA;
        this.nodeB = nodeB;
    }

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
        if( this.constructor.opStr!==undefined )
            var opStr = this.constructor.opStr
        else if( this.opStr !== undefined )
            var opStr = this.opStr
        else
            var opStr = '?'
        return `${this.constructor.name} ${this.nodeA.debugName} ${opStr} ${this.nodeB.debugName}`;
    }
    
    toStringWithValues () {
        if( this.constructor.opStr!==undefined )
            var opStr = this.constructor.opStr
        else if( this.opStr !== undefined )
            var opStr = this.opStr
        else
            var opStr = '?'
        return `${this.nodeA.debugName} ${this.nodeA.constraintCheckValue} ${opStr} ${this.nodeB.constraintCheckValue} ${this.nodeB.debugName}`;
    }
    
    get nodes () { return [this.nodeA, this.nodeB] }
    
    static matchesEnsure (args) {
        return (
            args.length==3 && 
            args[0] instanceof Node && 
            args[1] == this.opStr && 
            args[2] instanceof Node
        )
    }
    
    static ensure () {
        if( ! this.matchesEnsure([...arguments]) )
            throw new Error(`invalid arguments`);
        const nodeA = arguments[0];
        const nodeB = arguments[2];
        const c = new this(nodeA,nodeB);
        nodeA.addConstraint(c);
        nodeB.addConstraint(c);
        return c;
    }
}
exports.BinaryConstraint = BinaryConstraint;
