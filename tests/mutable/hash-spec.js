// Conditional definition to work also in the browser
// tests where Freezer is global
if( typeof Freezer == 'undefined' ){
	var Freezer = require( '../../freezer.js' );
	var assert = require('assert');
}

var freezer, data;

var example = {
	a: 1,
	b: { z: 0, y: 1, x:[ 'A', 'B'] },
	c: [1, 2, {w: 3}],
	d: null
};

describe("Freezer hash test", function(){
	beforeEach( function(){
		freezer = new Freezer( example, true );
		data = freezer.getData();
	});

	it( "Add a new element to a hash", function(){
		var chained = data.b.set({e:5});

		var updated = freezer.getData();

		assert.equal( chained, updated.b );
		assert.notEqual( updated, data );
		assert.equal( updated.b.e, 5 );
	});

	it( "Add a new element to a hash doesnt modify other hash elements", function(){
		var chained = data.b.set({e:5});

		var updated = freezer.getData();

		assert.equal( chained, updated.b );
		assert.equal( updated.b.z, data.b.z );
		assert.equal( updated.b.y, data.b.y );
		assert.equal( updated.b.x, data.b.x );
	});

	it( "Remove a hash element", function(){
		var chained = data.remove('a');

		var updated = freezer.getData();

		assert.equal( chained, updated );
		assert.equal( updated.a, undefined );
	});

	it( "Parents are deleted from a removed object", function(){
		var chained = data.remove('b');

		assert.equal( data.b.__.parents.length , 0 );
	});

	it( "A removed hash element can't update the data", function(){
		var b = data.b;

		data.remove('b');

		var updated = freezer.getData();

		assert.equal( updated.b, undefined );

		b.set({ z: 2 });

		var second = freezer.getData();

		assert.equal( second, updated );
	});

	it( "Remove multiple hash elements", function(){
		var chained = data.remove(['a', 'b']);

		var updated = freezer.getData();

		assert.equal( chained, updated );
		assert.equal( updated.a, undefined );
		assert.equal( updated.b, undefined );
	});

	it( "Remove elements should not modify other hash elements", function(){
		data.remove(['a', 'b']);

		var updated = freezer.getData();

		assert.equal( updated.c, data.c );
		assert.equal( updated.d, data.d );
	});

	it( "Remove an unexistent element should not modify any element", function(){
		data.remove('u');

		var updated = freezer.getData();

		assert.equal( updated, data );
	});

	it( "Add an null key should work", function(){
		var chained = data.set({u: null});

		var updated = freezer.getData();

		assert.equal( chained, updated );
		assert.equal( updated.u, null );
	});

	it( "Removing a duplicate node should preserve duplicates", function(){
		data.c.set( {0: data.b} );

		var updated = freezer.getData();
		assert.equal( updated.b, updated.c[0] );

		updated.remove( 'b' );

		var second = freezer.getData();

		assert.equal( second.c[0], data.b );
	});

	it( "Removing all duplicates should remove the node", function(){
		data.set( {d: data.b} );

		var updated = freezer.getData(),
			d = updated.d
		;
		assert.equal( updated.b, updated.d );

		updated.remove( 'b' );

		var second = freezer.getData();
		assert.equal( second.d, data.b );

		second.remove( 'd' );

		var third = freezer.getData();
		assert.equal( third.d, undefined );

		d.set({z: 9});

		var fourth = freezer.getData();
		assert.equal( third, fourth );
	});

	it( "Reset an object", function(){
		var foobar = { foo: 'bar', bar: 'foo' },
			updated = data.b.reset( foobar )
		;

		assert.deepEqual( updated, foobar );
		assert.equal( freezer.getData().b, updated );
	});

	it( "#toJS", function(){
		assert.deepEqual( data.toJS(), example );
	});

});