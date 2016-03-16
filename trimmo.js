
var boardId, pushState = window.history.pushState, oldBoard, rooted = true;

window.history.pushState = function() {
	oldBoard = rooted ? false : $(".js-list-board-members")[0];

	var ret = pushState.apply(history, arguments);
	rooted = false;

	console.log(location.href, /\/b\/([^\/]*)\//g.test(location.href));

	if (/\/b\/([^\/]*)\//g.test(location.href)) {
		main();
	}
};

$(main);
function main() {
	
	boardId = /\/b\/([^\/]*)\//g.exec(location.href);

	if (boardId && boardId.length && boardId[1]) {

		boardId = boardId[1];
		
		console.log("Parsed boardId is", boardId);
	
	} else {
	
		console.log("boardId missed");
	
		return;
	}

	$.get("/1/boards/" + boardId, function(data) { 

		console.log("True boardId is", boardId = data.id);

		bindUI();
	});
}

function escapeHtml(text) {

	var map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};

	return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function windowStat(stat) {

	var gstat = {}, 
		tstat = {};

	stat.forEach(function(card) {

		var date = new Date(card.date);

		if (!gstat[card.list]) {
			gstat[card.list] = "";
			tstat[card.list] = 0;
		}

		gstat[card.list] += "<p>" + card.time + " - " + date + "</p>";
		tstat[card.list] += card.time_src;
	});

	var strStat = "<ul>";

	for (var list in gstat) {
		strStat += 
			"<li><h4>" + escapeHtml(list) + "</h4>" 
				+ "<b>Total:</b> " + minsToString(tstat[list]) + "<br>"
				+ gstat[list] + "</li>";
	}

	strStat += "</ul>";

	var statWin = window.open();
	statWin.document.body.innerHTML += strStat;
}

window.TRIMMO = function(element) {

	var username = /\(([^\(]*)\)$/g.exec($(element).find("*").attr("title"))[1];

	setTimeout(function() {

		if (!$(".board-member-menu .pop-over-list li.trimmo." + username).length) {
			$(".board-member-menu .pop-over-list li:first-child").after("<li class=\"timmo " + username + "\"><a class=\"disabled\">trimmo is loading...</a></li>");
		}

	}, 100);

	getUserWorkingTime(username, function(time, stat) {

		$(".board-member-menu .pop-over-list li.timmo." + username + " a")
			.removeClass("disabled").html(time).attr("href", "#")
			.click(function(e) {
				e.preventDefault();
				windowStat(stat);
			});

	});
};

function bindUI() {

	console.log("UI is building...");

	setTimeout(function() {

		var boardMembers = $(".js-list-team-members");

		if (!boardMembers.length || oldBoard == boardMembers[0]) {
			return bindUI();
		}

		console.log("UI is builded", boardMembers);
		boardMembers.find(".member").attr("onclick", "TRIMMO(this)");

	}, 500);
}

function dualDigits(d) {
	return d < 10 ? "0" + d : "" + d;
}

function minsToString(smins) {
	var hours = Math.floor(smins / 60), rhours = Math.round(smins / 60),
		mins = smins % 60;

	if (smins < 60) {
		return smins + " minutes";
	}

	return smins + " minutes &rarr; " + dualDigits(hours) + ":" + dualDigits(mins) + " &rarr; " + rhours + " hours";
}


function getUserWorkingTime(username, cb) {

	var page = 0, _continue = true, minutes = 0, stat = [];

	function handler(data) { 

		_continue = data.length == 50;

		data.some(function(comment) {

			if (/\#timeend(\s|$)/g.test(comment.data.text)) {
				_continue = false;
				return true;
			}

			var time = /\#time([\d]*:[\d]*)/g.exec(comment.data.text);

			if (time && time.length && time[1]) {
				time = time[1].split(":");
				time = time[0]*60 + time[1]*1;
				minutes += time;

				stat.push({ 
					list: comment.data.card.name, 
					time: minsToString(time), 
					time_src: time, 
					date: comment.date 
				});
			}

			return false;
		});

		if (!_continue) {
			cb(minsToString(minutes), stat);
		} else {
			$.get("/1/members/" + username + "/actions?filter=commentCard&limit=50&page=" + page++ + "&idModels=" + boardId, handler);
		}
	}

	$.get("/1/members/" + username + "/actions?filter=commentCard&limit=50&page=" + page++ + "&idModels=" + boardId, handler);
}