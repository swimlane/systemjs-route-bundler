var assert = require('assert');
var nearestCommonAncestor = require('../lib/nearest-common-ancestor');

// tests derived from: https://gist.github.com/benpickles/4059636

function createElement(name, parent) {
  var elem = {
    "moduleName": name
  }
  if (parent) {
    if (parent.children) {
      parent.children.push(elem);
    } else {
      parent.children = [elem];
    }
    elem.parent = parent;
  }
  return elem;
}

var root = createElement('root')           // .
var elem1 = createElement('elem1', root)   // ├── elem1
var elem2 = createElement('elem2', elem1)  // |   ├── elem2
var elem3 = createElement('elem3', elem1)  // |   └── elem3
var elem4 = createElement('elem4', elem3)  // |       └── elem4
var elem5 = createElement('elem5', root)   // └── elem5

describe('nearest-common-ancestor', function() {
  it('has the same parent', function() {
    assert(nearestCommonAncestor.nca([elem1, elem5]) === root);
  })

  it('has same parent but deeper', function() {
    assert(nearestCommonAncestor.nca([elem4, elem5]) === root);
  })

  it('has direct child of the other', function() {
    assert(nearestCommonAncestor.nca([elem1, elem2]) === elem1);
  })

  it('has grandchild of the other', function () {
    assert(nearestCommonAncestor.nca([elem1, elem4]) === elem1);
  })

  it('has no common ancestor', function () {
    var root2 = createElement();
    var thrown = false;
    try {
      nearestCommonAncestor.nca([elem3, root2]);
    } catch (e) {
      thrown = true;
    }
    assert(thrown);
  })
});
