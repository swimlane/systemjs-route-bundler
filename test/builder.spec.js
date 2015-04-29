import routeBundler from '../lib/builder';
import assert from 'assert';

let routesSrc = [
	{
		"stateName": "route1",
		"urlPrefix": "/route1",
		"type": "load",
		"src": "app/route1/route1"
	},
	{
		"stateName": "route2",
		"urlPrefix": "/route2",
		"type": "load",
		"src": "app/route2/route2"
	}
].map(function(r) { return r.src; });

let config = {
	baseURL: 'test/output/',
	main: 'app/app',
	routes: routesSrc,
	bundleThreshold: 2.0,
	config: 'test/fixtures/system.config.js',
	sourceMaps: true,
	minify: false,
	dest: 'test/output',
	destJs: 'test/output/app.js'
};

describe('builder', () => {
  it('can bundle a route', () => {
    return routeBundler.build(config).then(function(result) {

      // TODO: add some tests to ensure that files on disk are accurate.

      assert.equal(result, true);
    });
  });
});
