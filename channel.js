
'use strict';

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
            const rv = callback();
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
                // TODO: speaker should not assume callback has an 'alive' prop
                // create an independent describeCallback func to produce this string
                console.log(`    ${callback.name} ${callback.alive}`);
        }
    }
}

class ListenerMixin {
    _initListener () {
        this._hearingFrom = new Set();
    }

    _unlistenAll () {
        for( let callback of this._hearingFrom ) {
            //console.log(`CHAN: _unlistenAll 1: ${callback.alive} :: ${callback.name}`)
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

        const describe = () => `callback ${other.debugName} ${eventType} ${this.debugName}`;
        Object.defineProperty(cb, 'name', {
            //value: `callback ${other.constructor.name} ${eventType} ${this.constructor.name}`
            value: describe()
        });

        //cb.name = 'CBNAME';
        cb.speaker = other;
        cb.receiver = this;
        cb.eventType = eventType;
        cb.method = method;
        
        other.speakTo(eventType, cb);
        this._hearingFrom.add(cb);
    }
    
    _dumpListener () {
        console.log(`  hearingFrom:`);
        for( let callback of this._hearingFrom )
            console.log(`    ${callback.name} ${callback.alive}`);
    }
}

class ChannelMixin {
    _initChannel (eventTypes) {
        this._eventTypes = new Set(eventTypes);
        
        // TODO
        if( '_initListener' in this.constructor.prototype )
            this._initListener();
        if( '_initSpeaker' in this.constructor.prototype )
            this._initSpeaker();
    }
    
    _chanDump () {
        console.log(`chanDump for ${this.debugName}`);
        // TODO
        if( '_initListener' in this.constructor.prototype )
            this._dumpListener();
        if( '_initSpeaker' in this.constructor.prototype )
            this._dumpSpeaker();
    }
}

function applyMixin(mixinClass, cls, eventTypes) 
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

exports.mixinChannelSpeak = (cls, eventTypes) => {
    applyMixin(SpeakerMixin, cls, eventTypes);
    applyMixin(ChannelMixin, cls, eventTypes);
}

exports.mixinChannelBi = (cls, eventTypes) => {
    applyMixin(SpeakerMixin, cls, eventTypes);
    applyMixin(ListenerMixin, cls, eventTypes);
    applyMixin(ChannelMixin, cls, eventTypes);
}
