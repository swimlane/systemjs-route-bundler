# SystemJS Route Bundle Builder

A build tool for [SystemJS Builder](https://github.com/systemjs/builder) that will identify your routes and build separate JS files for each.

### Concept

Bundling isn't a new concept but with a large applications you have quite a bit of overlap of components between your routes. Typically those bundles would just be looped up into the main momdule. Our bundler is unique in the fact that it identifies potential optimizations and creates micro-bundles. So lets take a look at:

![example](https://raw.githubusercontent.com/swimlane-contrib/systemjs-route-bundler/master/assets/tree.png)

We can see that the Modal component is used by Login and Profile but not by Admin. We can also see that Select is used by all the modules. The most optimal way to download this module graph would be to only download Modal when Login or Profile is requested. But you don't want to include it in the main download nor do you want to include it twice in each module. Our bundler identifies the overlap and creates a new module that is shared between those. So the above example results in something like:

![result](https://raw.githubusercontent.com/swimlane-contrib/systemjs-route-bundler/master/assets/result.png)

This bundler can work with ANY platform, all you need is a route definition and to use SystemJS. At Swimlane we use Angular 1.x in our production application, so we wanted to make it work nicely with Angular. So we created a demo [AngularJS + SystemJS seed project](https://github.com/swimlane-contrib/angular1-systemjs-seed) that demonstrates this!

In short, the bundler can cut your initial load time to tenths of what it is now without having to manage your bundle definitions!

### Configuration

Option  | Description
------------- | -------------
baseURL | Base URL of the project
dest  | Destination folder for the output
main  | The main file of your application
destMain | The destination folder of your main file
routes | An array of the file names of the main routes of your project. Each of the routes will have its own bundle
bundleThreshold | The ratio of routes including a module over which the module will be bundled in the main bundle. Value must been between 0 and 1. 0.6 means that if 60% of the routes contain a single module, that module will be bundled in the main bundle
jspmConfigPath | Path to the systemjs config file
jspmBrowserPath | Path to the systemjs browser config file
sourceMaps | Build sourceMaps for the bundles
minify | Minify the javascript
mangle | Mangle javascript variables
verboseOutput | Output debug information while tracing and bundling
ignoredPaths | Paths that will not be bundled. Put all paths that contain external libraries here

Check the [AngularJS + SystemJS seed](https://github.com/swimlane-contrib/angular1-systemjs-seed/blob/master/gulpfile.js#L230) project for an example configuration.

### Credits

`systemjs-route-bundler` is a [Swimlane](http://swimlane.com) open-source project; we believe in giving back to the open-source community by sharing some of the projects we build for our application. Swimlane is an automated cyber security operations and incident response platform that enables cyber security teams to leverage threat intelligence, speed up incident response and automate security operations.
