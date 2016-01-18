# Freezer Changelog
###v0.9.6
* Fixes orphan markDirty call.
* Fixes setting null value. Thanks @kuraga
* Improved readme. Thanks @ivantm

###v0.9.4
* Not working internally with dirty nodes anymore.
* Fixed some nodes getting out of sync when having nested duplicate nodes.

###v0.9.3
* Using messages for nextTick implementation only in browsers. Needed to make freezer work with react native.

###v0.9.2
* Not triggering events in all parents when a node have more than one parent.

###v0.9.1
* Fixed specialEvents problem in build

###v0.9.0
* Added `beforeAll` and `afterAll` events.
* `this` in event listeners now point to the current freezer object.
* Fixed `Freezer.prototype.set` not working with plain objects.
* Fixed some typos in README.

###v0.8.2
* Fixed `set` not accepting numerical keys.

###v0.8.1
* `once` now returns the listener/freezer object.

###v0.8.0
* `now` returns the current node, like any other updater method.
* Fixed nodes losing the live mode on update. Thanks to @zenfe.
* Fixed nodes triggering event in the wrong order when pivot. Thanks to @zenfe.
* Tests passing now in Node 4. Thanks @kuraga.
* Adds setting properties to undefined. Thanks to @rsamec.

###v0.7.1
* Fixed `now` method triggering `update` event twice.
* Fixed live mode not triggering events in intermediate nodes.

###v0.7.0
* Added `pivot`` method.
* Added `now` method.

###v0.6.1
* Fixed binding parents to the nodes on reset.
* Fixed not removing an specific listener when using `off`.

###v0.6.0
* Added options to freezer initialization.
* Added mutable option in order of create mutable freezer objects.
* Added live mode option.

###v0.5.2
* Fixed reseting top nodes not updating the store
* Fixed some == comparisons that would modify incorrect attributes.
* Fixed modifying the object passed to `set` as argument.
* Added the playground to the readme file.

###v0.5.1
* Fixed some typos in the readme file
* Freezer is now extendable using ES6 classes

###v0.5.0
* Fixed: Now duplicated nodes are updated properly when they are children of the root node.
* Added: Transactions
* Added: Non-frozen nodes.

###v0.4.2
* Added: `reset` method to nodes.
* Fixed: Some typos.
* Added: An example to the README.md

###v0.4.1
* Licensed changed to MIT.

###v0.4.0
* Improved: Array nodes are now real arrays
* Fixed: Parent links are now working properly when a Freezer store is reseted.
* Removed: `toJSON` method is not needed anymore, since arrays are acutal arrays now.
* Added: Created a test HTML page.

###v0.3.3
* Improved: Performance on refreshing parent nodes on update.
* Added: `toJS` and `toJSON` methods on nodes to get a pure JS object from a node.
* Removed: Path legacy code from curxor.js

###v0.3.2
* Fixed: Chained calls should trigger update with the value of all operations. https://github.com/arqex/freezer/issues/2

###v0.3.1
* Fixed: A cloned node in a frozen should update all the parents at the same time.
* Fixed: Array concat method doesn't work as expected. https://github.com/arqex/freezer/issues/1

###v0.3.0
* First released version after forking curxor.
* Binding nodes using references to parents.
