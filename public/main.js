// main.js

requirejs.config({
    baseUrl: 'js',
    paths: {
        'Jetpack':'./Jetpack',
        'hammerjs':'./hammer'
    }
});

requirejs(['Jetpack'], function(stuff) {
    jetpack = new stuff.Jetpack;
	jetpack.bootstrap(levelID => {
		jetpack.go(levelID);
	});	
});