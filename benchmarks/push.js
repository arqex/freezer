'use strict';

var B = require('benchmark'),
	Freezer = require('../freezer'),
	initialData = require('./initialData'),
	Immutable = require( 'immutable')
;

var suite = new B.Suite(),
	store = new Freezer( initialData ),
	data = store.get(),
	imm = new Immutable.fromJS( initialData ),
	leaf = data[1][0][0][0][0],
	immLeaf = imm.getIn(['1', '0', '0', '0', '0'])
;

suite
	.add( 'Update leaf', function(){
		for (var i = 0; i < 1000; i++) {
			leaf = leaf.set(0, i);
		}
	})
	.add( 'Update leaf with transaction', function(){
		var trans = leaf.transact();
		for (var i = 0; i < 1000; i++) {
			trans[0] = i;
		}
		leaf.run();
	})
	.add( 'Update immutable leaf', function(){
		for (var i = 0; i < 1000; i++) {
			immLeaf.set(0,i);
		}
	})
	.add( 'Update immutable withMutations', function(){
		immLeaf.withMutations( function( list ){
			for (var i = 0; i < 1000; i++) {
				list[0] = i;
			}
		});
	})
	.on('cycle', function(event) {
	  console.log(String(event.target));
	})
	.run( { async: true} )
;