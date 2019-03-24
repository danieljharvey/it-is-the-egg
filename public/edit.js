// editor.js
console.log("editjs");
requirejs.config({
  baseUrl: "js",
  paths: {
    Editor: "./Jetpack",
    Jetpack: "./Jetpack",
    hammerjs: "./hammer"
  }
});

requirejs(["Editor"], function(stuff) {
  console.log(stuff);
  editor = new stuff.Editor();
  editor.bootstrap(levelID => {
    editor.edit(levelID);
  });
});
