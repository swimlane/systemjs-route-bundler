var gulp = require('gulp');
var treeWalker = require('./tree-walker');
var Builder = require('systemjs-builder');
var RSVP = require('rsvp');
var insert = require('gulp-insert');

var builder = new Builder();
var appTree;
var routeTrees = [];
var promises = [];
var treeCache = {};

RSVP.on('error', function(reason) {
  console.error(false, reason.stack);
});

var build = function (config) {
  if (config.verboseOutput){
    console.log('Config:');
    console.log(config);
    console.log('');
  }

  console.log('tracing source files...');
  return builder.loadConfig(config.systemConfig, undefined, true).then(function() {
    return treeWalker.getTrees(config.main, config, treeCache).then(function (tree) {
      appTree = tree;

      config.routes.forEach(function (route) {
        promises.push(new RSVP.Promise(function (resolve, reject) {
          treeWalker.getTrees(route, config, treeCache).then(function (tree) {
            routeTrees.push(tree);
            resolve();
          });
        }));
      });

      return RSVP.all(promises).then(function () {
        // Remove app tree dependencies from route trees;
        removeDepsFromRoutes();
        // generate inverse index of dependencies
        var inverseIndex = generateInverseIndex();
        // generate bundles
        console.log('generating bundles...');
        var bundles = generateBundles(inverseIndex, config.bundleThreshold, config.main);
        // build trees
        console.log('building...');
        return buildTrees(bundles, config);
      });
    }, function (error) {
      console.error(error.stack)
    });

  });
};

var removeDepsFromRoutes = function () {
  Object.keys(appTree).forEach(function (moduleName) {
    routeTrees.forEach(function (treeIndex) {
      if (treeIndex[moduleName]) {
        // deleting the dep tree
        delete treeIndex[moduleName];
        // removing dep from the other trees
        Object.keys(treeIndex).forEach(function (depName) {
          treeIndex[depName].tree = builder.subtractTrees(treeIndex[depName].tree, appTree[moduleName].tree);
        });
      }
    });
  });
};

var generateInverseIndex = function () {
  var inverseIndex = {};
  routeTrees.forEach(function (treeIndex, i) {
    Object.keys(treeIndex).forEach(function (depName) {
      if (inverseIndex[depName] === undefined) {
        inverseIndex[depName] = [i];
      } else {
        inverseIndex[depName].push(i);
      }
    });
  });
  return inverseIndex;
};

var generateBundles = function (inverseIndex, bundleThreshold, mainName) {
  var bundles = {};
  // generating bundles
  Object.keys(inverseIndex).forEach(function (moduleName) {
    // if it's included in only one route, leave it there
    if (inverseIndex[moduleName].length === 1) {
      return;
    }

    var module = routeTrees[inverseIndex[moduleName][0]][moduleName];
    if (inverseIndex[moduleName].length / routeTrees.length >= bundleThreshold) {
      // if it's included in more than the threshold of the routes, put it in app
      //console.log('shared by more than ' + (bundleThreshold*100) + '% of routes - including in app');
      appTree[mainName].tree = builder.addTrees(appTree[mainName].tree, module.tree);
      appTree[moduleName] = module;
    } else {
      // otherwise, put it in a bundle
      var bundleName = inverseIndex[moduleName].sort().join('-') + ".js";
      if (bundles[bundleName] === undefined) {
        bundles[bundleName] = module;
      } else {
        bundles[bundleName].tree = builder.addTrees(bundles[bundleName].tree, module.tree);
      }
    }

    // remove from other trees;
    inverseIndex[moduleName].forEach(function (index) {
      var treeIndex = routeTrees[index];
      delete treeIndex[moduleName];

      Object.keys(treeIndex).forEach(function (depName) {
        treeIndex[depName].tree = builder.subtractTrees(treeIndex[depName].tree, module.tree);
      });

    })
  });
  return bundles;
};

var buildTrees = function (bundles, config) {
  var builderPromises = [];

  // build bundles
  var bundlesConfig = {};
  console.log('building bundles...');
  Object.keys(bundles).forEach(function (bundleName) {
    builderPromises.push(new RSVP.Promise(function (resolve, reject) {
      buildTree(bundles[bundleName], "bundles/" + bundleName, config).then(function () {
        resolve();
      }, function (error) {
        console.log(error);
        console.log(error.stack);
      });
    }));

    var bundledModules = [];
    Object.keys(bundles[bundleName].tree).filter(function (item) {
      return item.indexOf('.css!') === -1
    }).forEach(function(n){
      bundledModules.push(n);
    })

    bundlesConfig["bundles/" + bundleName] = bundledModules;
  });

  // build route trees
  console.log('building routes...');
  routeTrees.forEach(function (treeIndex) {
    Object.keys(treeIndex).forEach(function (moduleName) {
      builderPromises.push(new RSVP.Promise(function (resolve, reject) {
        buildTree(treeIndex[moduleName], moduleName + '.js', config).then(function () {
          resolve();
        }, function (error) {
          console.log(error);
          console.log(error.stack)
        });
      }));
    });
  });

  // build root app
  console.log('building app...');
  Object.keys(appTree).forEach(function (moduleName) {
    builderPromises.push(new RSVP.Promise(function (resolve, reject) {
      var isMainModule = config.main.indexOf(moduleName) === 0;

      buildTree(appTree[moduleName], moduleName, config).then(function () {
        if (isMainModule) {
          if (config.verboseOutput){
            console.log('embedding bundles config...');
          }
          var bundlesString = "System.config({bundles: " + JSON.stringify(bundlesConfig, null, 4) + "});";
          gulp.src(config.dest + '/' + config.main)
            .pipe(insert.prepend(bundlesString))
            .pipe(gulp.dest(config.destMain))
            .on('end', function() {
              resolve();
            })
        } else {
          resolve();
        }
      }, function (error) {
        console.log(error);
        console.log(error.stack)
      })
    }));
  });

  return RSVP.all(builderPromises).then(function () {
    console.log('build succeeded');
    return true;
  }, function (error) {
    console.log(error);
    console.log(error.stack)
  })
};

var buildTree = function (tree, destination, config) {
  // Don't build external libraries
  for (var i = 0; i < config.ignoredPaths.length; i++) {
    if (destination.indexOf(config.ignoredPaths[i]) !== -1){
      if (config.verboseOutput){
        console.log('\t\t skipping ' + destination);
      }
      return new RSVP.Promise(function (resolve, reject) {
        resolve();
      })
    }
  };

  if (config.verboseOutput){
    console.log('\t\t building ' + destination);
  }

  return builder.bundle(tree.tree, config.dest + '/' + destination + "", {
    sourceMaps: config.sourceMaps,
    minify: config.minify,
    mangle: config.mangle,
    config: config.systemConfig,
    rollup: true
  })
};

module.exports = {
  build: build
};
