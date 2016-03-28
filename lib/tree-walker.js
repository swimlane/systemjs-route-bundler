var RSVP = require('rsvp');
var clone = require('./clone');
var nearestCommonAncestor = require('./nearest-common-ancestor');

// returns all the trees of the file's dependencies, optimized
var getTrees = function(main, config, treeCache, builder){
  var inverseIndex = {};
  var treeIndex = {};
  var trees = [];

  // adds tree to caches
  var addToCache = function(tree){
    var found = trees.filter(function(el){
      return el.moduleName === tree.moduleName;
    });

    if (found.length === 0){
      treeCache[tree.moduleName] = tree;
      trees.push(tree);
      treeIndex[tree.moduleName] = tree;
    }
  }

  var buildDeps = function(src, level){
    if (config.verboseOutput){
      // console.log('\t\t tracing ' + src);
    }

    // trace source to get dependency tree
    return builder.trace(src, {browser: true, production: true}).then(function(tt){
      var traceTree = {
        moduleName: src,
        tree: tt
      }
      addToCache(traceTree, src);

      // extract dependency source paths
      var sources = Object.keys(traceTree.tree);

      // process each dependency individually, and collect their trees
      var subTrees = [];
      var promises = [];

      sources.forEach(function(source){
        if (source === src){
          return;
        }

        if (inverseIndex[source]){
          if (inverseIndex[source].indexOf(traceTree) === -1) {
            inverseIndex[source].push(traceTree);
          }
        } else {
          inverseIndex[source] = [traceTree];
        }

        promises.push(new RSVP.Promise(function(resolve, reject) {
          if (treeCache[source]){
            var subTree = clone.shallowClone(treeCache[source]);
            addToCache(subTree, source);
            subTrees.push(subTree);
            resolve();
          } else {
            buildDeps(source, level + 1).then(function (subTree) {
              subTrees.push(subTree);
              resolve();
            });
          }
        }));
      })

      return RSVP.all(promises).then(function(){
        traceTree.children = subTrees;

        subTrees.forEach(function(subTree){
          subTree.parent = traceTree;
        })
        return traceTree;
      });

    }, function(error) {
      console.log(error);
      console.log(error.stack);
    });
  }

  return buildDeps(main, 1).then(function(tree){
    Object.keys(inverseIndex).forEach(function(depName){
      var depTree = treeIndex[depName];

      var commonAncestor = nearestCommonAncestor.nca(inverseIndex[depName]);
      commonAncestor.tree = builder.addTrees(commonAncestor.tree, depTree.tree);

      inverseIndex[depName].forEach(function(n){
        if (n.moduleName === depTree.moduleName || n.moduleName === commonAncestor.moduleName){
          return;
        }
        n.tree = builder.subtractTrees(n.tree, depTree.tree);
      })

    })
    return treeIndex;
  });
}

module.exports = {
  getTrees: getTrees
};
