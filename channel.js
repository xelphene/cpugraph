
'use strict';

const LISTENER_MIXIN_CALLBACK = Symbol('LISTENER_MIXIN_CALLBACK');
const CHANNEL_MIXIN_LISTENER = Symbol('CHANNEL_MIXIN_LISTENER');
const CHANNEL_MIXIN_SPEAKER = Symbol('CHANNEL_MIXIN_SPEAKER');

function isLMCallback(callback) {
    return callback.hasOwnProperty(LISTENER_MIXIN_CALLBACK)
}

function describeCallback( callback ) {
    if( isLMCallback(callback) )
        return `LM callback ${callback.eventType} @ ${callback.speaker.debugName} -> ${callback.listener.debugName}.${callback.method.name} alive=${callback.alive}`;
    else {
        return `generic callback ${JSON.stringify(callback.toString())}`
    }
}

class SpeakerMixin {
    _initSpeaker () {
        this._speakingTo = new Map();
        for( let eventType of this._eventTypes )
            this._speakingTo.set(eventType, new Set())
    }
    
    speakTo (eventType, callback) {
        if( ! this._eventTypes.has(eventType) )
            throw new Error(`${this.constructor.name} has no eventType named ${eventType}`);
        this._speakingTo.get(eventType).add(callback);
    }
    
    stopSpeakingTo (eventType, callback) {
        if( ! this._eventTypes.has(eventType) )
            throw new Error(`${this.constructor.name} has no eventType named ${eventType}`);
        if( ! this._speakingTo.get(eventType).has(callback) )
            throw new Error(`${this.constructor.name} asked to stop speaking a callback that we are not speaking to: ${callback}`);
        this._speakingTo.get(eventType).delete(callback);
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
    }
    
    _dumpSpeaker () {
        console.log(`  speakingTo:`);
        for( let eventType of this._eventTypes ) {
            for( let callback of this._speakingTo.get(eventType) )
                console.log(`    ${describeCallback(callback)}`)
        }
    }
    
    says (eventType) { return this._eventTypes.has(eventType) }
}

class ListenerMixin {
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
        cb[LISTENER_MIXIN_CALLBACK] = true;

        cb.speaker = other;
        cb.listener = this;
        cb.eventType = eventType;
        cb.method = method;
        
        other.speakTo(eventType, cb);
        this._hearingFrom.add(cb);
    }
    
    _dumpListener () {
        console.log(`  hearingFrom:`);
        for( let callback of this._hearingFrom )
            //console.log(`    ${callback.name} ${callback.alive}`);
            console.log(`    ${describeCallback(callback)}`)
    }
}

class ChannelMixin {
    _initChannel () {
        if( this.constructor.prototype.hasOwnProperty(CHANNEL_MIXIN_LISTENER) )
            this._initListener();
        if( this.constructor.prototype.hasOwnProperty(CHANNEL_MIXIN_SPEAKER) )
            this._initSpeaker();
    }
    
    _chanDump () {
        console.log(`chanDump for ${this.debugName}`);
        if( this.constructor.prototype.hasOwnProperty(CHANNEL_MIXIN_LISTENER) )
            this._dumpListener();
        if( this.constructor.prototype.hasOwnProperty(CHANNEL_MIXIN_SPEAKER) )
            this._dumpSpeaker();
    }
}

function mergeMixinClass(mixinClass, cls) 
{
    for( let propName of Object.getOwnPropertyNames(mixinClass.prototype) )
    {
        if( propName=='constructor' )
            continue;
        //console.log(`MIXIN: ${mixinClass.name}.${propName} -> ${cls.name}`);
        if( propName in cls.prototype )
            throw new Error(`class ${cls.name} already has a property named ${propName}`);
        cls.prototype[propName] = mixinClass.prototype[propName];
    }
}

function applySpeak(cls, eventTypes) {
    mergeMixinClass(SpeakerMixin, cls);

    eventTypes = new Set(eventTypes);
    for( let eventType of eventTypes ) {
        Object.defineProperty(cls.prototype, 'on'+eventType, {
            get: callback => function (callback) {
                this.speakTo(eventType, callback)
            }
        })
        Object.defineProperty(cls.prototype, 'says'+eventType, {
            get: function () {
                return this.says(eventType)
            }
        })
    }
    Object.defineProperty(cls.prototype, '_eventTypes', {
        value: eventTypes
    })
    
    Object.defineProperty(cls.prototype, CHANNEL_MIXIN_SPEAKER, {
        value: true,
        enumerable: false
    });
}

function applyListen(cls) {
    mergeMixinClass(ListenerMixin, cls);
    Object.defineProperty(cls.prototype, CHANNEL_MIXIN_LISTENER, {
        value: true,
        enumerable: false
    });
}

function applyCommon(cls) {
    mergeMixinClass(ChannelMixin, cls);
}

exports.mixinChannelSpeak = (cls, eventTypes) => 
{
    applySpeak(cls, eventTypes);
    applyCommon(cls, eventTypes);
}

exports.mixinChannelBi = (cls, eventTypes) => {
    applySpeak(cls, eventTypes);
    applyListen(cls);
    applyCommon(cls);
}
