// Conditional definition to work also in the browser
// tests where Freezer is global
if( typeof Freezer == 'undefined' ){
	var Freezer = require( '../freezer.js' );
	var assert = require('assert');
}

var freezer, data;

var example = [1,2,3,{a:1}];

describe("Freezer array as root test", function(){
	beforeEach( function(){
		freezer = new Freezer( example );
		data = freezer.getData();
	});

	it( 'Reset', function(){
		var result = [1,2,3];

		data = data.reset( result );
		assert.deepEqual( data, result );
		assert.deepEqual( freezer.getData(), result );
	});

	it( 'Splice', function(){
		var result = [1,2,3,4];

		data = data.splice( 3, 1, 4 );
		assert.deepEqual( data, result );
		assert.deepEqual( freezer.getData(), result );
	});

	it( 'Pop', function(){
		var result = [1,2,3];

		data = data.pop();
		assert.deepEqual( data, result );
		assert.deepEqual( freezer.getData(), result );
	});

	it( 'push', function(){
		var result = [1,2,3,{a:1},5];

		data = data.push( 5 );
		assert.deepEqual( data, result );
		assert.deepEqual( freezer.getData(), result );
	});

	it( 'shift', function(){
		var result = [2,3,{a:1}];

		data = data.shift();
		assert.deepEqual( data, result );
		assert.deepEqual( freezer.getData(), result );
	});

	it( 'unshift', function(){
		var result = [0,1,2,3,{a:1}];

		data = data.unshift( 0 );
		assert.deepEqual( data, result );
		assert.deepEqual( freezer.getData(), result );
	});

});