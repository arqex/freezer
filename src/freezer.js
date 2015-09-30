'use strict';

var Utils = require( './utils.js' ),
	Emitter = require( './emitter' ),
	Mixins = require( './mixins' ),
	Frozen = require( './frozen' )
;

//#build
var Freezer = function( initialValue, options ) {
	var me = this,
		mutable = ( options && options.mutable ) || false,
		live = ( options && options.live ) || live
	;

	// Immutable data
	var frozen;

	var notify = function notify( eventName, node, options ){
		var _ = node.__;

		if( eventName == 'listener' )
			return Frozen.createListener( node );

		if( eventName == 'now' ){
			if( _.listener ){
				Frozen.trigger( node, 'update', 0, true );

				if( !_.parents.length )
					_.listener.trigger('immediate', 'now');
			}
			for (var i = 0; i < _.parents.length; i++) {
				notify('now', _.parents[i]);
			}
			return;
		}

		var update = Frozen.update( eventName, node, options );

		if( eventName != 'pivot' ){
			var pivot = Utils.findPivot( update );
			if( pivot )
	  			return pivot;
		}

		return update;
	};

	var freeze = function(){};
	if( !mutable )
		freeze = function( obj ){ Object.freeze( obj ); };

	// Create the frozen object
	frozen = Frozen.freeze( initialValue, notify, freeze, live );

	// Listen to its changes immediately
	var listener = frozen.getListener();

	// Updating flag to trigger the event on nextTick
	var updating = false;

	listener.on( 'immediate', function( prevNode, updated ){

		if( prevNode == 'now' ){
			if( !updating )
				return;
			updating = false;
			return me.trigger( 'update', frozen );
		}

		if( prevNode != frozen )
			return;

		frozen = updated;

		if( live )
			return me.trigger( 'update', updated );

		// Trigger on next tick
		if( !updating ){
			updating = true;
			Utils.nextTick( function(){
				if( updating ){
					updating = false;
					me.trigger( 'update', frozen );
				}
			});
		}
	});

	Utils.addNE( this, {
		get: function(){
			return frozen;
		},
		set: function( node ){
			var newNode = notify( 'reset', frozen, node );
			newNode.__.listener.trigger( 'immediate', frozen, newNode );
		}
	});

	Utils.addNE( this, { getData: this.get, setData: this.set } );

	// The event store
	this._events = [];
}

Freezer.prototype = Utils.createNonEnumerable({constructor: Freezer}, Emitter);
//#build

module.exports = Freezer;
