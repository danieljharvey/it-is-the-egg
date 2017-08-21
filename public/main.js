// main.js

requirejs.config({
    baseUrl: 'js',
    paths: {
        'Jetpack':'./Jetpack'
    }
});

requirejs(['Jetpack'], function(stuff) {
    jetpack = new stuff.Jetpack;
	jetpack.go();	
});