if (/\/\/trello\.com/g.test(location.href)) {
	var trimmo = document.createElement("script");
	trimmo.src = chrome.extension.getURL("trimmo.js");

	document.head.appendChild(trimmo);
}