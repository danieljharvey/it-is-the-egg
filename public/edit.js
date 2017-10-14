// editor.js

requirejs.config({
    baseUrl: 'js',
    paths: {
        'Jetpack':'./Jetpack'
    }
});

requirejs(['Jetpack'], function(stuff) {
    jetpack = new stuff.Jetpack;
    editor = jetpack.getEditor();
	editor.bootstrap(levelID => {
		editor.edit(levelID);
	});	
});
