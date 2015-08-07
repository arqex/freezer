'use strict';

var B = require('benchmark'),
	Freezer = require('../freezer'),
	initialData = require('./initialData'),
	Immutable = require( 'immutable')
;

var suite = new B.Suite(),
	store = new Freezer( initialData ),
	mutable = new Freezer( initialData, {mutable: true} ),
	data = store.getData(),
	leaf = data[1][0][0][0][0],
	mutableData = mutable.get(),
	mutableLeaf = mutableData[1][0][0][0],
	leafData = initialData[1][0][0][0][0],
	i = 0,
	imm = Immutable.fromJS( initialData ),
	leafPath = ['1', '0', '0', '0', '0']
;

var o = {
	enu: 1
};

Object.defineProperty( o, 'nenu', {
	writable: true,
	value: 2
});

suite
	.add( 'Freezer creation', function(){
		new Freezer( initialData );
	})
	.add( 'Freezer mutable creation', function(){
		new Freezer( initialData, {mutable: true} );
	})
	.add( 'Immutable creation', function(){
		Immutable.fromJS( initialData );
	})
	.add( 'Update 1st level branch', function(){
		data = data.set(0, initialData[0]);
	})
	.add( 'Update 1st level mutable branch', function(){
		mutableData = mutableData.set(0, initialData[0]);
	})
	.add( 'Immutable 1st level branch', function(){
		imm = imm.set('0', Immutable.fromJS( initialData[0] ) );
	})
	.add( 'Update leaf', function(){
		leaf = leaf.set(0, ++i);
	})
	.add( 'Mutable leaf', function(){
		mutableLeaf = mutableLeaf.set(0, ++i);
	})
	.add( 'Immutable Update leaf', function(){
		imm = imm.updateIn( leafPath, function(){
			return ++i;
		});
	})
	.add( 'Copy 1st level branch', function(){
		data = data.set( 2, data[ i++ % 2 ] );
	})

	.add( 'Copy mutable 1st level branch', function(){
		mutableData = mutableData.set( 2, data[ i++ % 2 ] );
	})
	.add( 'Immutable copy 1st level branch', function(){
		imm = imm.set( 2, imm.get( i++ % 2 ) );
	})
	.on('cycle', function(event) {
	  console.log(String(event.target));
	})
	.on('complete', function(){
		//console.log( this );
	})
	.run({ async: true})
;
