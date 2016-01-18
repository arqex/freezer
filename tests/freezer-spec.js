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

	it( "Reset with a previous state", function( done ){
		var counter = 0;
		data.set({b: 5});
		freezer.on('update', function(){
			if( !counter ){
				freezer.set( data );
				counter++;
			}
			else if( counter == 1 ){
				assert.equal( counter, 1 );
				assert.equal( freezer.get(), data );

				freezer.get().b.set({z:10});
				counter++;
			}
			else {
				assert.equal( freezer.get().b.z, 10 );
				done();
			}
		});

		freezer.get().set({c: 6});
	});

	it( "Reset with a value", function( done ){
		var counter = 0;
		data.set({b: 5});
		freezer.on('update', function(){
			if( !counter ){
				freezer.set( {z:{a:1}} );
				counter++;
			}
			else if( counter == 1 ){
				assert.equal( freezer.get().z.a, 1 );
				assert.equal( freezer.get().a, undefined );
				freezer.get().z.set({b:2});
				counter++;
			}
			else {
				assert.equal( freezer.get().z.a, 1 );
				assert.equal( freezer.get().z.b, 2 );
				done();
			}
		});

		freezer.get().set({c: 6});
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

	it( "Update a value to null", function(){
		data.set('a', null);

		var updated = freezer.getData();

		assert.deepEqual( updated.a, null );

		assert.notEqual( updated, data );
	});

	it( "Update an undefined value to null", function(){
		data = data.set('a', undefined);
		data.set('a', null);

		var updated = freezer.getData();

		assert.strictEqual( updated.a, null );

		assert.notEqual( updated, data );
	});

	it( "Update an null value to undefined", function(){
		data = data.set('a', null);
		data.set('a', undefined);

		var updated = freezer.getData();

		assert.strictEqual( updated.a, undefined );

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

	it( "Duplicated nodes should be updated at the same time.", function(){
		data = data.set({selected: data.b.x});

		data.selected.push( data.c[2] );

		data = freezer.get();

		assert.equal( data.selected, data.b.x );
		assert.equal( data.selected, data.c[2].__.parents[1] );

		data.selected[2].set({u: 4});

		data = freezer.get();

		assert.equal( data.selected, data.b.x );
	});

	it( "Duplicated nodes should be updated at the same time 2.", function( done ){
		var freezer = new Freezer({a:[], b:[{z:1}]});

		freezer.get().a.push( freezer.get().b[0] );
		freezer.get().set( {c: freezer.get().b[0] } );

		var count = 0;
		freezer.on('update', function(){
			count++;
		});

		var cCount = 0;
		freezer.get().c.getListener().on( 'update', function(){
			cCount++;
		});

		var c = freezer.get().c.set({y:2});

		var data = freezer.get();
		assert.equal( data.a[0], data.b[0] );
		assert.equal( data.c, data.b[0] );
		assert.equal( data.c, c );
		assert.equal( data.b[0], c );

		setTimeout( function(){
			assert.equal( count, 1 );
			assert.equal( cCount, 1 );
			done();
		}, 200);
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
