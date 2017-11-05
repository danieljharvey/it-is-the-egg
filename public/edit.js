// editor.js

requirejs.config({
    baseUrl: 'js',
    paths: {
        'Jetpack':'./Jetpack',
        'hammerjs':'./hammer'
    }
});

requirejs(['Jetpack'], function(stuff) {
    jetpack = new stuff.Jetpack;
    editor = jetpack.getEditor();
	editor.bootstrap(levelID => {
		editor.edit(levelID);
	});	
});
