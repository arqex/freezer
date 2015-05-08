# Freezer Changelog
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