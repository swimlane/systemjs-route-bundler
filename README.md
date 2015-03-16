# SystemJS Route Bundle Builder [![Build Status](https://travis-ci.org/Swimlane/systemjs-route-bundler.svg?branch=master)](https://travis-ci.org/Swimlane/systemjs-route-bundler) [![Codacy Badge](https://www.codacy.com/project/badge/c33f4b50d38b477b926c5b0d462d9317)](https://www.codacy.com/public/amcdaniel2/systemjs-route-bundler)

Magical code to split your systemjs project into bundles based on singple-page application top level routes. [SystemJS builder](https://github.com/systemjs/builder) is used under the covers.

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

### Used by

* [AngularJS + SystemJS seed](https://github.com/swimlane/angular-systemjs-seed)
* [SystemJS + Angular + React seed](https://github.com/lookfirst/systemjs-seed)
