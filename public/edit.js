// editor.js

requirejs.config({
    baseUrl: 'js',
    paths: {
        'Jetpack':'./Jetpack'
    }
});

requirejs(['Jetpack'], function(stuff) {
    jetpack = new stuff.Jetpack;
	jetpack.bootstrap(levelID => {
		jetpack.edit(levelID);
	});	
});
