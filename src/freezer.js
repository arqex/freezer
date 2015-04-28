'use strict';

var Utils = require( './utils.js' ),
	Emitter = require( './emitter' ),
	Mixins = require( './mixins' ),
	Frozen = require( './frozen' )
;

//#build
var Freezer = function( initialValue, mutable ) {
	var me = this;

	me._notify = function notify( eventName, node, options ){
		if( eventName == 'listener' )
			return Frozen.createListener( node );

		return Frozen.update( eventName, node, options );
	};

	var freeze = function(){};
	if( !mutable )
		freeze = function( obj ){ Object.freeze( obj ); };

	// Create the frozen object
	me._frozen = Frozen.freeze( initialValue, me._notify, freeze );

	// Listen to its changes immediately
	var listener = me._frozen.getListener();

	// Updating flag to trigger the event on nextTick
	var updating = false;

	listener.on( 'immediate', function( prevNode, updated ){
		if( prevNode != me._frozen )
			return;

		me._frozen = updated;

		// Trigger on next tick
		if( !updating ){
			updating = true;
			Utils.nextTick( function(){
				updating = false;
				me.trigger( 'update', me._frozen );
			});
		}
	});

	// The event store
	this._events = [];
}

var getterAndSetter = {
	get: function(){
		return this._frozen;
	},
	set: function( node ){
		var newNode = this._notify( 'reset', this._frozen, node );
		newNode.__.listener.trigger( 'immediate', this._frozen, newNode );
	}
};
getterAndSetter.getData = getterAndSetter.get;
getterAndSetter.setData = getterAndSetter.set;

Freezer.prototype = Utils.createNonEnumerable(getterAndSetter, Emitter);
Freezer.prototype.constructor = Freezer; // this hasn't been copied because non-enumerable

//#build

module.exports = Freezer;