// Conditional definition to work also in the browser
// tests where Freezer is global
if( typeof Freezer == 'undefined' ){
	var Freezer = require( '../freezer.js' );
	var assert = require('assert');
}

var freezer, data;

var example = {
	a: 1,
	b: { z: 0, y: 1, x:[ 'A', 'B'] },
	c: [1, 2, {w: 3}],
	d: null
};

describe("Freezer test", function(){
	beforeEach( function(){
		freezer = new Freezer( example );
		data = freezer.getData();
	});

	it( "Create a freezer object", function(){

		assert.equal( data.a, example.a );
		assert.equal( data.b.z, example.b.z );
		assert.equal( data.b.x[0], example.b.x[0] );
		assert.equal( data.c[0], example.c[0] );
		assert.equal( data.c[2].w, example.c[2].w );
		assert.equal( data.d, example.d);
	});

	it( "Leaves dont have an __", function(){
		assert.equal( data.a.__, undefined );
		assert.equal( data.b.z.__, undefined );
		assert.equal( data.c[1].__, undefined );
	});

	it( "Update a value", function(){
		data.set({a: {b:1} });

		var updated = freezer.getData();

		assert.equal( updated, updated.a.__.parents[0]);
		assert.deepEqual( updated.a, {b:1} );
		assert.notEqual( updated, data );
	});

	it( "Update a value with a string key", function(){
		data.c.set('0', 3);

		var updated = freezer.getData();

		assert.equal( updated.c[0], 3);
	});

	it( "Update a value with a numeric key", function(){
		data.c.set(0, 3);

		var updated = freezer.getData();

		assert.equal( updated.c[0], 3);
	});

	it( "Update a value to undefined", function(){
		data.set('a', undefined);

		var updated = freezer.getData();

		//note that assert is using other property (b) to access parent, because a is set to undefined
		assert.equal( updated, updated.b.__.parents[0]);

		//test affected property as usual
		assert.deepEqual( updated.a, undefined );

		assert.notEqual( updated, data );
	});

	it( "Update a value doesnt modify other elements", function(){
		data.set({a: 2});

		var updated = freezer.getData();

		assert.equal( updated.b, data.b );
		assert.equal( updated.c, data.c );
		assert.equal( updated.d, data.d );
	});

	it( "Update an array value", function(){
		data.c.set({0: 2});

		var updated = freezer.getData();

		assert.equal( updated.c[0], 2 );
		assert.notEqual( updated, data );
		assert.notEqual( updated.c, data.c );
	});

	it( "Update an array value doesnt modify other elements", function(){
		data.c.set({1: 2});

		var updated = freezer.getData();

		assert.equal( updated.a, data.a );
		assert.equal( updated.b, data.b );
		assert.equal( updated.c[0], data.c[0] );
		assert.equal( updated.c[2], data.c[2] );
	});

	it( "Duplicate node", function(){
		data.set( {d: data.b} );
		var updated = freezer.getData();

		assert.equal( data.b, updated.d );
		assert.notEqual( data, updated );
	});

	it( "A duplicate node should be updated in every part of the tree", function(){
		data.set( {d: data.b} );
		data.b.set( {z: 2} );

		var updated = freezer.getData();

		assert.equal( updated.b, updated.d );
		assert.equal( updated.d.z, 2 );
	});

	it( "All duplicated node parents should be updated at the same time", function(){
		data.c[2].set( {y: data.b.x } );

		var updated = freezer.get();


		assert.equal( updated.b.x.__.parents.length, 2 );
		assert.equal( updated.b.x.__.parents[1], updated.c[2] );
		assert.equal( updated.b.x.__.parents[0], updated.b );

		updated.b.x.push( 'C' );

		var second = freezer.get();

		assert.notEqual( updated, second );
		assert.notEqual( updated.c, second.c );
		assert.notEqual( updated.c[2], second.c[2] );
		assert.notEqual( updated.b, second.b );
		assert.equal( second.b.x.__.parents.length, 2 );
		assert.equal( second.b.x.__.parents[1], second.c[2] );
		assert.equal( second.b.x.__.parents[0], second.b );
	});

	it( "Restore a previous state", function(){
		data.set( {e: 9, f: 8} );
		data.b.set( {y: 10} );

		var updated = freezer.getData();

		assert.equal( updated.b.y, 10 );
		assert.equal( updated.e, 9 );
		assert.equal( updated.f, 8 );
		assert.equal( updated.c, data.c );

		freezer.setData( data );

		var second = freezer.getData();

		assert.equal( second, data );
		assert.equal( second.e, undefined );
		assert.equal( second.c, data.c );
		assert.equal( second.b.y, data.b.y );
	});

	it( "Chaining calls", function(){
		var chained = data.set( {e: 9} )
			.set( {f: 0} )
			.set( {a: [2,3,4] } )
		;
		var updated = freezer.getData();

		assert.equal( chained, updated );

	});

	it( "#toJSON", function(){
		assert.equal( JSON.stringify( data ), JSON.stringify( example ) );
	});

	it( "Set should work in the current node, not in the nodes == to the curent ", function(){
		var freezer = new Freezer({a:0, b:[], c:false, d:null});

		freezer.get().b.push(1);
		assert.deepEqual( freezer.get(), {a:0, b:[1], c:false, d: null} );
	});

	it( "Pivot", function(){
		var update = data.pivot()
			.b.set({u: 10})
			.b.x.push( 'C' )
			.c[2].remove('w')
		;

		assert.equal( update.b.u, 10 );
		assert.equal( update.b.x[2], 'C' );
		assert.equal( update.c[2].w, undefined);
	});

	it( "Pivot must dissapear on event", function( done ){
		var handler = function handler( newData ){
			freezer.off('update', handler);
			var newPivot = newData.b.set({u: 20});
			assert.equal( newPivot.u, 20 );
			assert.equal( newData.__.pivot, 0 );
			done();
		}
		freezer.on( 'update', handler);

		var updated = data.pivot()
			.b.set({u: 10})
		;
		assert.equal( updated.b.u, 10 );
	});

	it( "Pivot should not change event order", function(){
		var triggered = '',
			handler = function( key ){
				return function( update ){
					triggered += key;
				};
			}
		;

		data.getListener().on('update', handler(2));
		data.c.getListener().on('update', handler(3));
		data.c[2].getListener().on('update', handler(4));
		freezer.on('update', handler(1));

		data = data.pivot().c[2].set( {w:4} ).now();
		data = data.pivot().c[2].set( {w:5} ).now();
		data = data.pivot().c[2].set( {w:6} ).now();

		assert.equal( triggered, '432143214321' );
	});

	it( "Pivot should not change event order in live mode", function(){
		var freezer = new Freezer( example, { live: true } ),
			data = freezer.get()
		;

		var triggered = '',
			handler = function( key ){
				return function( update ){
					triggered += key;
				};
			}
		;

		data.getListener().on('update', handler(2));
		data.c.getListener().on('update', handler(3));
		data.c[2].getListener().on('update', handler(4));
		freezer.on('update', handler(1));

		data = data.pivot().c[2].set( {w:4} );
		data = data.pivot().c[2].set( {w:5} );
		data = data.pivot().c[2].set( {w:6} );

		assert.equal( triggered, '432143214321' );
	});

});
