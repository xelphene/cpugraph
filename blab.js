
'use strict';

const BLAB_LISTENER_CALLBACK = Symbol('BLAB_LISTENER_CALLBACK');
const BLAB_LISTENER = Symbol('BLAB_LISTENER');
const BLAB_SPEAKER = Symbol('BLAB_SPEAKER');

function isLMCallback(callback) {
    return callback.hasOwnProperty(BLAB_LISTENER_CALLBACK)
}

function describeCallback( callback ) {
    if( isLMCallback(callback) )
        return `LM callback ${callback.eventType} @ ${callback.speaker.debugName} -> ${callback.listener.debugName}.${callback.method.name} alive=${callback.alive}`;
    else {
        return `generic callback ${JSON.stringify(callback.toString())}`
    }
}

class BlabSpeakerMixin {
    _initSpeaker () {
        this._speakingTo = new Map();
        for( let eventType of this._eventTypes )
            this._speakingTo.set(eventType, new Set())

        this._speakingToMethods = new Map();
        for( let eventType of this._eventTypes )
            this._speakingToMethods.set(eventType, []);
    }
    
    speakTo (eventType, callback) {
        if( ! this._eventTypes.has(eventType) )
            throw new Error(`${this.constructor.name} has no eventType named ${eventType}`);
        if( typeof(callback) != 'function' )
            throw new Error(`function required for callback, not ${typeof(callback)}`);
        this._speakingTo.get(eventType).add(callback);
    }
    
    speakToMethod( eventType, object, method ) {
        if( ! this._eventTypes.has(eventType) )
            throw new Error(`${this.constructor.name} has no eventType named ${eventType}`);        
        this._speakingToMethods.get(eventType).push({object, method});
    }

    onAnyOf(eventTypes, callback) {
        for( let eventType of eventTypes ) {
            if( this.says(eventType) ) {
                this.speakTo(eventType, callback)
                return
            }
        }
        throw new Error(`onAnyOf: speaker ${this.debugName} says none of ${eventTypes}`);
    }
    
    stopSpeakingTo (eventType, callback) {
        if( ! this._eventTypes.has(eventType) )
            throw new Error(`${this.constructor.name} has no eventType named ${eventType}`);
        if( ! this._speakingTo.get(eventType).has(callback) )
            throw new Error(`${this.constructor.name} asked to stop speaking a callback that we are not speaking to: ${callback}`);
        this._speakingTo.get(eventType).delete(callback);
    }
    
    stopSpeakingToMethod (eventType, object) {
        if( ! this._eventTypes.has(eventType) )
            throw new Error(`${this.constructor.name} has no eventType named ${eventType}`);        

        const newList = [];
        for( let om of this._speakingToMethods.get(eventType) )
            if( om.object!==object )
                newList.push(om)
        if( newList.length == this._speakingToMethods.get(eventType).length )
            throw new Error(`no method listeners for ${eventType} to ${object.construtor.name}`);
        this._speakingToMethods.set(eventType, newList);
    }
    
    _say(eventType) {
        if( ! this._speakingTo.has(eventType) )
            throw new Error(`${this.constructor.name} has no eventType named ${eventType}`);
        for( let callback of this._speakingTo.get(eventType) ) {
            const rv = callback(this);
            if( rv === false ) {
                //console.log(`CHAN: CB ${callback.name} returned false`);
                const didDel = this._speakingTo.get(eventType).delete(callback)
            }
        }
        for( let om of this._speakingToMethods.get(eventType) ) {
            om.method.apply(om.object, [this]);
        }
    }
    
    _dumpSpeaker () {
        console.log(`  speakingTo:`);
        for( let eventType of this._eventTypes ) {
            for( let callback of this._speakingTo.get(eventType) )
                console.log(`    ${describeCallback(callback)}`)
            for( let om of this._speakingToMethods.get(eventType) )
                console.log(`    ${om.object.constructor.name}.${om.method.name}`);
        }
    }
    
    says (eventType) { return this._eventTypes.has(eventType) }
}

class BlabListenerMixin {
    _initListener () {
        this._hearingFrom = new Set();
    }

    _unlistenAll () {
        for( let callback of this._hearingFrom ) {
            //console.log(`CHAN: _unlistenAll 1: ${callback.alive} :: ${callback.name}`)
            if( isLMCallback(callback) )
                callback.alive = false;
            //console.log(`CHAN: _unlistenAll 2: ${callback.alive} :: ${callback.name}`)
            this._hearingFrom.delete(callback);
            //callback.speaker.stopSpeakingTo(callback.eventType, callback);
        }
    }
    
    _listenTo (other, eventType, method) {
        var cb = speaker => {
            if( cb.alive ) {
                //console.log(`CHAN: CB: ${cb.name} I am alive`);
                method.apply(this, other)
            } else {
                //console.log(`CHAN: CB: ${cb.name} I am now dead`);
                this._hearingFrom.delete(cb);
            }
            return cb.alive;
        }
        cb.alive = true;
        cb[BLAB_LISTENER_CALLBACK] = true;

        cb.speaker = other;
        cb.listener = this;
        cb.eventType = eventType;
        cb.method = method;
        
        other.speakTo(eventType, cb);
        this._hearingFrom.add(cb);
    }
    
    _listenToForAny (other, eventTypes, method) {
        for( let eventType of eventTypes ) {
            if( other.says(eventType) ) {
                this._listenTo(other, eventType, method)
                return
            }
        }
        throw new Error(`_listenToForAny: speaker ${other.debugName} says none of ${eventTypes}`);
    }
    
    
    _dumpListener () {
        console.log(`  hearingFrom:`);
        for( let callback of this._hearingFrom )
            console.log(`    ${describeCallback(callback)}`)
    }
    
    get hearingFromObjects () {
        return [...this._hearingFrom].map(
            cb => isLMCallback(cb) ? cb.speaker : null
        ).filter(
            cb => cb !== null
        )
    }
}

class ChannelMixin {
    _initChannel () {
        if( this.constructor.prototype.hasOwnProperty(BLAB_LISTENER) )
            this._initListener();
        if( this.constructor.prototype.hasOwnProperty(BLAB_SPEAKER) )
            this._initSpeaker();
    }
    
    _chanDump () {
        console.log(`chanDump for ${this.debugName}`);
        if( this.constructor.prototype.hasOwnProperty(BLAB_LISTENER) )
            this._dumpListener();
        if( this.constructor.prototype.hasOwnProperty(BLAB_SPEAKER) )
            this._dumpSpeaker();
    }
}

function mergeMixinClass(mixinClass, cls) 
{
    for( let propName of Object.getOwnPropertyNames(mixinClass.prototype) )
    {
        if( propName=='constructor' )
            continue;
        
        const propDesc = Object.getOwnPropertyDescriptor(mixinClass.prototype, propName);
        
        if( 'value' in propDesc && typeof(propDesc.value)=='function' ) {
            //console.log(`MIXIN: method: ${mixinClass.name}.${propName} -> ${cls.name}`);
            if( propName in cls.prototype )
                throw new Error(`class ${cls.name} already has a property named ${propName}`);
            Object.defineProperty(cls.prototype, propName, {
                value: propDesc.value,
                writable: propDesc.writable,
                enumerable: propDesc.enumerable,
                configurable: propDesc.configurable
            })
        } else if( 'get' in propDesc && typeof(propDesc.get)=='function' ) {
            //console.log(`MIXIN: getter: ${mixinClass.name}.${propName} -> ${cls.name}`);
            if( propName in cls.prototype )
                throw new Error(`class ${cls.name} already has a property named ${propName}`);
            Object.defineProperty(cls.prototype, propName, {
                get: propDesc.get,
                enumerable: propDesc.enumerable,
                configurable: propDesc.configurable
            })
        } else
            throw new Error(`mixin class ${mixinClass.name} has unknown property ${propName} of type ${typeof(mixinClass.prototype[propName])}`);
    }
}

function applySpeak(cls, eventTypes) {
    mergeMixinClass(BlabSpeakerMixin, cls);

    eventTypes = new Set(eventTypes);
    for( let eventType of eventTypes ) {
        Object.defineProperty(cls.prototype, 'on'+eventType, {
            get: callback => function (callback) {
                this.speakTo(eventType, callback)
            }
        })
        Object.defineProperty(cls.prototype, 'says'+eventType, {
            //value: function () {
            //    return this.says(eventType)
            //}
            get: function () {
                return this.says(eventType)
            }
        })
        Object.defineProperty(cls.prototype, '_say'+eventType, {
            value: function () {
                return this._say(eventType);
            }
        })
    }
    Object.defineProperty(cls.prototype, '_eventTypes', {
        value: eventTypes
    })
    
    Object.defineProperty(cls.prototype, BLAB_SPEAKER, {
        value: true,
        enumerable: false
    });
}

function applyListen(cls) {
    mergeMixinClass(BlabListenerMixin, cls);
    Object.defineProperty(cls.prototype, BLAB_LISTENER, {
        value: true,
        enumerable: false
    });
}

function applyCommon(cls) {
    mergeMixinClass(ChannelMixin, cls);
}

////// public API ////////////////////////////////////

function mixinBlabSpeak (cls, eventTypes) {
    applySpeak(cls, eventTypes);
    applyCommon(cls, eventTypes);
}
exports.mixinBlabSpeak = mixinBlabSpeak;

function mixinBlabFull (cls, eventTypes) {
    applySpeak(cls, eventTypes);
    applyListen(cls);
    applyCommon(cls);
}
exports.mixinBlabFull = mixinBlabFull;

function mixinBlabListen (cls) {
    applyListen(cls);
    applyCommon(cls);    
}
exports.mixinBlabListen = mixinBlabListen;
