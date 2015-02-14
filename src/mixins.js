'use strict';

var Utils = require( './utils.js' );

//#build
var createNE = function( attrs ){
	var ne = {};

	for( var key in attrs ){
		ne[ key ] = {
			writable: true,
			configurable: true,
			enumerable: false,
			value: attrs[ key]
		}
	}

	return ne;
}

var commonMethods = {
	set: function( attr, value ){
		var attrs = attr;

		if( typeof value != 'undefined' ){
			attrs = {};
			attrs[ attr ] = value;
		}

		return this.__.notify( 'replace', this, attrs );
	},
	getPaths: function( attrs ){
		return this.__.notify( 'path', this );
	},
	getListener: function(){
		return this.__.notify( 'listener', this );
	}
};

var FrozenArray = Object.create( Array.prototype, createNE( Utils.extend({
	push: function( el ){
		return this.append( [el] );
	},

	append: function( els ){
		if( els && els.length )
			return this.__.notify( 'splice', this, [this.length, 0].concat( els ) );
		return this;
	},

	pop: function(){
		if( !this.length )
			return this;

		return this.__.notify( 'splice', this, [this.length -1, 1] );
	},

	unshift: function( el ){
		return this.prepend( [el] );
	},

	prepend: function( els ){
		if( els && els.length )
			return this.__.notify( 'splice', this, [0, 0].concat( els ) );
		return this;
	},

	shift: function(){
		if( !this.length )
			return this;

		return this.__.notify( 'splice', this, [0, 1] );
	},

	splice: function( index, toRemove, toAdd ){
		return this.__.notify( 'splice', this, arguments );
	},

	concat: function( ){
		return Array.prototype.concat.apply( this.slice(), arguments );
	}
}, commonMethods)));


// Tweak the length property
Object.defineProperty( FrozenArray, 'length', {
	configurable: false,
	enumerable: false,
	get: function(){
		return Object.keys( this ).length;
	},
	set: function( length ){
		for( var key in this ){
			if( key > length )
				delete this[ key ];
		}
	}
});

var Mixins = {

Hash: Object.create( Object.prototype, createNE( Utils.extend({
	remove: function( keys ){
		var filtered = [],
			k = keys
		;

		if( keys.constructor != Array )
			k = [ keys ];

		for( var i = 0, l = k.length; i<l; i++ ){
			if( this.hasOwnProperty( k[i] ) )
				filtered.push( k[i] );
		}

		if( filtered.length )
			return this.__.notify( 'remove', this, filtered );
		return this;
	}
}, commonMethods))),

List: FrozenArray
};
//#build

module.exports = Mixins;