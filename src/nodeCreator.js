'use strict';

var Utils = require( './utils.js' );

//#build
var nodeCreator = {
	init: function( Frozen ){

		var commonMethods = {
			set: function( attr, value ){
				var attrs = attr,
					update = this.__.trans
				;

				if( typeof attr !== 'object' ){
					attrs = {};
					attrs[ attr ] = value;
				}

				if( !update ){
					for( var key in attrs ){
						update = update || this[ key ] !== attrs[ key ];
					}

					// No changes, just return the node
					if( !update )
						return Utils.findPivot( this ) || this;
				}

				return this.__.store.notify( 'merge', this, attrs );
			},

			reset: function( attrs ) {
				return this.__.store.notify( 'replace', this, attrs );
			},

			getListener: function(){
				return Frozen.createListener( this );
			},

			toJS: function(){
				var js;
				if( this.constructor === Array ){
					js = new Array( this.length );
				}
				else {
					js = {};
				}

				Utils.each( this, function( child, i ){
					if( child && child.__ )
						js[ i ] = child.toJS();
					else
						js[ i ] = child;
				});

				return js;
			},

			transact: function(){
				return this.__.store.notify( 'transact', this );
			},

			run: function(){
				return this.__.store.notify( 'run', this );
			},

			now: function(){
				return this.__.store.notify( 'now', this );
			},

			pivot: function(){
				return this.__.store.notify( 'pivot', this );
			}
		};

		var arrayMethods = Utils.extend({
			push: function( el ){
				return this.append( [el] );
			},

			append: function( els ){
				if( els && els.length )
					return this.__.store.notify( 'splice', this, [this.length, 0].concat( els ) );
				return this;
			},

			pop: function(){
				if( !this.length )
					return this;

				return this.__.store.notify( 'splice', this, [this.length -1, 1] );
			},

			unshift: function( el ){
				return this.prepend( [el] );
			},

			prepend: function( els ){
				if( els && els.length )
					return this.__.store.notify( 'splice', this, [0, 0].concat( els ) );
				return this;
			},

			shift: function(){
				if( !this.length )
					return this;

				return this.__.store.notify( 'splice', this, [0, 1] );
			},

			splice: function( index, toRemove, toAdd ){
				return this.__.store.notify( 'splice', this, arguments );
			}
		}, commonMethods );

		var FrozenArray = Object.create( Array.prototype, Utils.createNE( arrayMethods ) );

		var objectMethods = Utils.createNE( Utils.extend({
			remove: function( keys ){
				var filtered = [],
					k = keys
				;

				if( keys.constructor !== Array )
					k = [ keys ];

				for( var i = 0, l = k.length; i<l; i++ ){
					if( this.hasOwnProperty( k[i] ) )
						filtered.push( k[i] );
				}

				if( filtered.length )
					return this.__.store.notify( 'remove', this, filtered );
				return this;
			}
		}, commonMethods));

		var FrozenObject = Object.create( Object.prototype, objectMethods );

		var createArray = (function(){
			// fast version
			if( [].__proto__ )
				return function( length ){
					var arr = new Array( length );
					arr.__proto__ = FrozenArray;
					return arr;
				}

			// slow version for older browsers
			return function( length ){
				var arr = new Array( length );

				for( var m in arrayMethods ){
					arr[ m ] = arrayMethods[ m ];
				}

				return arr;
			}
		})();

		this.clone = function( node ){
			var cons = node.constructor;
			if( cons === Array ){
				return createArray( node.length );
			}
			else {
				if( cons === Object ){
					return Object.create( FrozenObject );
				}
				// Class instances
				else {
					return Object.create( cons.prototype, objectMethods );
				}
			}
		}
	}
}
//#build

module.exports = nodeCreator;
