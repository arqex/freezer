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

describe("Freezer transact test", function(){
	beforeEach( function(){
		freezer = new Freezer( example );
		data = freezer.getData();
	});

	it("Hash transaction", function(){
		var trans = data.b.transact();

		trans.w = 3;

		assert.equal( freezer.getData().b, data.b );
		assert.equal( data.b.w, undefined );

		delete trans.z;

		assert.equal( freezer.getData().b, data.b );
		assert.equal( data.b.a, example.b.a );

		var updated = data.b.run();

		assert.equal( freezer.getData().b, updated );
		assert.equal( updated.z, undefined );
		assert.equal( updated.y, 1 );
		assert.equal( updated.w, 3 );
		assert.notEqual( updated.b, data.b );
	});

	it("Array transaction", function(){
		data.c.transact()
			.push( 4 )
		;

		assert.equal( freezer.getData().c, data.c );
		assert.equal( data.c[3], undefined );

		data.c.shift();

		assert.equal( freezer.getData().c, data.c );
		assert.equal( data.c[0], example.c[0] );

		var updated = data.c.run();

		assert.equal( freezer.getData().c, updated );
		assert.equal( updated[0], example.c[1] );
		assert.equal( updated[2], 4 );
		assert.equal( updated[3], undefined );
		assert.notEqual( updated, data.c );
	});

	it("Deep transaction", function(){

		data.c.transact();

		var updatedC2 = data.c[2]
			.set({v: 4})
			.remove('w')
		;

		assert.equal( freezer.getData().c, data.c );
		assert.notEqual( data.c[2], updatedC2 );

		var updated = data.c.run();

		assert.equal( updated[2], updatedC2 );
		assert.equal( freezer.getData().c, updated );

		updated = updated[2].set({u:5});

		assert.equal( freezer.getData().c[2], updated );
	});

	it("Autorun transaction", function( done ){
		var trans = data.b.transact();

		trans.w = 3;
		delete trans.z;

		freezer.on('update', function( updated ){
			assert.equal( updated.b.w, 3 );
			assert.equal( updated.b.z, undefined );
			assert.equal( updated.b.y, 1 );
			done();
		});
	});

	it("Deep transaction on a repeated node 1", function(){
		// Operation on a child of a transacted node
		var updated = data.set({ e: data.b.x, f: data.b.x });

		var trans = updated.b.transact();

		trans.x.push( 'C' );

		assert.equal( freezer.getData().b, updated.b );

		var updatedB = updated.b.run();

		assert.equal( freezer.getData().b, updatedB );
		assert.equal( updatedB.x.length , 3 );
		assert.equal( updatedB.x[2], 'C' );
		assert.equal( updatedB.x, freezer.getData().f );
		assert.equal( updatedB.x, freezer.getData().e );
	});

	it("Deep transaction on a repeated node 2", function(){
		// Operation on a clone of a child of a transacted clone
		// Let's check how trans behave with dirt
		var updated = data.c.push( data.b.x );

		var trans = updated.transact();

		trans[3].push( 'C' );

		assert.equal( freezer.getData().c, updated );

		updated.run();

		var transacted = freezer.get();

		assert.equal( transacted.c[3][2], 'C' );
		assert.equal( transacted.b.x[2], 'C' );
		assert.equal( transacted.c[3], transacted.b.x );
	});

	it("Nested transaction", function(){
		var transb = data.b.transact(),
			transx = data.b.x.transact()
		;

		transb.u = 3;
		transx.push('C');

		data.b.run();
		data.b.x.run();

		var updated = freezer.get();

		assert.equal( updated.b.u, 3 );
		assert.equal( updated.b.x[2], 'C' );
	});


	it("Nested transaction 2", function(){
		var transb = data.b.transact(),
			transx = data.b.x.transact()
		;

		transb.u = 3;
		transx.push('C');

		// Switch the order
		data.b.x.run();
		data.b.run();

		var updated = freezer.get();

		assert.equal( updated.b.u, 3 );
		assert.equal( updated.b.x[2], 'C' );
	});
});

