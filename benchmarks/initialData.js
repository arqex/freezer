'use strict';

var arr = [0,1,2,'3',4,'5'];

var createHashTree = function( leaf ){
	var root = {};
	arr.forEach( function(i) {
		root[i] = leaf;
	});
	return root;
}

var createArrayTree = function( leaf ){
	var root = [];
	arr.forEach( function(i){
		root.push( leaf );
	});
	return root;
};

// Add four levels in the tree
var root = arr;
for (var i = 0; i < 2; i++) {
	root = createArrayTree( createHashTree( root ) );
};

// Let's make it a hash (one level more)
// Items = Sum( 5^n ) n=0->number of levels
module.exports = createHashTree( root );