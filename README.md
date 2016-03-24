# SystemJS Route Bundle Builder [![Codacy Badge](https://www.codacy.com/project/badge/c33f4b50d38b477b926c5b0d462d9317)](https://www.codacy.com/public/amcdaniel2/systemjs-route-bundler) [![Dependency Status](https://david-dm.org/Swimlane/systemjs-route-bundler.svg)](https://david-dm.org/Swimlane/systemjs-route-bundler)
[![devDependency Status](https://david-dm.org/Swimlane/systemjs-route-bundler/dev-status.svg)](https://david-dm.org/Swimlane/systemjs-route-bundler#info=devDependencies)

Magical code to split your SystemJS project into bundles based on singple-page application top level routes. [SystemJS builder](https://github.com/systemjs/builder) is used under the covers.

Instead of generating a single giant .js file for your entire application, you get one .js file per route and potentially one more file per route that contains shared dependencies.

Imagine that you have 3 routes that each import two different dependencies. 2 routes share the same dependency.

```
/route1
  /dependency1
/route2
  /dependency1
/route3
  /dependency2
```

This would give you 5 separate .js files (3 for the routes and 2 for the dependencies). Two routes both share a dependency, therefore loading /route2 would only load one file if /route1 has already loaded (thanks to browser caching).

By pairing things with the [ocLazyLoad SystemJS Router](https://github.com/lookfirst/ocLazyLoad-SystemJS-Router), as users click around in your app and load routes, the related files for those routes are lazy loaded as needed. This cuts down on initial application load times.

### Configuration

Check the [AngularJS + SystemJS seed](https://github.com/Swimlane/angular-systemjs-seed/blob/master/gulpfile.js#L230) project for an example configuration.

Option  | Description
------------- | -------------
baseURL | Base URL of the project
dest  | Destination folder for the output
main  | The main file of your application
destMain | The destination folder of your main file
routes | An array of the file names of the main routes of your project. Each of the routes will have its own bundle
bundleThreshold | The ratio of routes including a module over which the module will be bundled in the main bundle. Value must been between 0 and 1. 0.6 means that if 60% of the routes contain a single module, that module will be bundled in the main bundle
systemConfig | Path to the systemjs config file
sourceMaps | Build sourceMaps for the bundles
minify | Minify the javascript
mangle | Mangle javascript variables
verboseOutput | Output debug information while tracing and bundling
ignoredPaths | Paths that will not be bundled. Put all paths that contain external libraries here

### Used by

* [AngularJS + SystemJS seed](https://github.com/swimlane/angular-systemjs-seed)
* [SystemJS + Angular + React seed](https://github.com/lookfirst/systemjs-seed)

### Credits

`systemjs-route-bundler` is a [Swimlane](http://swimlane.com) open-source project; we believe in giving back to the open-source community by sharing some of the projects we build for our application. Swimlane is an automated cyber security operations and incident response platform that enables cyber security teams to leverage threat intelligence, speed up incident response and automate security operations.
