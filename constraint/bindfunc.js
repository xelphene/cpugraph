
'use strict';

const {Constraint} = require('./base');

class BindFuncConstraint extends Constraint {
    constructor(nodes, func) {
        super({});
        this._func = func;
        this._nodes = nodes;
    }
    
    static ensure () {
        if( ! this.matchesEnsure([...arguments]) )
            throw new Error(`invalid arguments`);
        const nodes = arguments[0];
        const func = arguments[1];
        const c = new this(nodes, func);
        for( let n of nodes )
            n.addConstraint(c);
        return c;
    }

    static matchesEnsure( args ) {
        return (
            args.length==2 && 
            Array.isArray(args[0]) && 
            typeof(args[1])=='function'
        )
    }
    
    check () {
        return this._func.apply(null, this._nodes.map(n => n.constraintCheckValue) );
    }

    appliesToNode(node) {
        return this._nodes.includes(node);
    }

    toString () {
        return `${this.constructor.name} ${this._func.toString()} args=${this._nodes.map(n => n.debugName)}`;
    }

    toStringWithValues () {
        return `${this._func.toString()} args=${this._nodes.map(n => n.constraintCheckValue)}`;
    }
    

    get nodes () { return this._nodes }
}
exports.BindFuncConstraint = BindFuncConstraint;

function ensureFunc(nodes, func) {
    return BindFuncConstraint.ensure(...arguments);
}
exports.ensureFunc = ensureFunc;
