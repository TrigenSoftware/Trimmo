if (/\/\/trello\.com/g.test(location.href)) {
	var trimmo = document.createElement("script");
	trimmo.src = safari.extension.baseURI + "trimmo.js";
	trimmo.async = false;

	document.head.appendChild(trimmo);
}