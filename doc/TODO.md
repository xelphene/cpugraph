
# BuildProxy consolidation

merge 'o = func', 'o = hasNode(v)', 'o = Node' into an assignNode method

example in map_plane.js BuildProxy

# Constraint Check Efficiency

make constraint checks after assignment more efficient

right now it iterates over all Nodes in Universe.

# MapNode tests

write tests for MapNode / Mapper

base on play/map*.js

add test for map nodes created via buildproxy

# InputNode Initialization

make InputNodes know if they've been given an initial value upon Node
creation or assigned one afterwards.

If requesting InputNode.rawValue or InputNode.constraintCheckValue before
initialization, or any other operation that requires a value, an InitError
is thrown

If just requesting InputNode.value, return NodeValueProxy as I am now. 
(i.e.  during construction with BuildProxy).

this might get rid of the need for the ValueProxy / NodeValueProxy in some
cases.

see comment in node/compute.js:get value

I kind of feel like there should never be a time when an InputNode has no
value at all.
