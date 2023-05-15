controllers.helloWorldController = (function () {

	function activate(rootDiv) {
		rootDiv.style = "display: flex; background-color: lightgrey; color: #0e2d5e; justify-content: center; align-items: center; width: 100%; height: 100%";
		rootDiv.innerText = "Hello World!";
	}

	return {
		activate: activate
	}
})();
