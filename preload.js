const SERVERURL = "http://127.0.0.1:10721";
var gaming = false
var gameend = false
var startTime = 0;
var section = 0
var team = {
	teamA: {
		name: "A",
		score: 0
	},
	teamB: {
		name: "B",
		score: 0
	}
}
var subtitle = "Funky Scoreboard"

//	获取日志
function getlog(){
	let l;
	$.ajax({
		url: SERVERURL + '/log?t=' + Math.random(),
		async: false,
		success: function(result) {
			l = result
		}
	})
	return l
}

function loginguide(){
	$.ajax({
		url: SERVERURL + '/api/getcontrolpanel?t=' + Math.random(),
		async: false,
		success: function(result) {
			$('#loginguide-qr')[0].src = result.qr;
			$('#loginguide-url').text(result.url)
			$('#loginguide-verifycode').text(result.verifycode)

			let a = getlog().split('\r\n')
			let loghtml = ""
			var color = "";
			a.forEach(element => {
				switch(element.split(']')[1]){
					case "[INFO":
						color = 'green'
						break;
					case "[WARN":
						color = 'yellow'
						break;
					case "[ERROR":
						color = 'lightcoral'
						break
					default:
						color = 'grey'
				}
				loghtml += `<span style="color: ${color}">${element}</span><br>`
			});
			$('#loginguide-log').html(loghtml)
			let ll = document.getElementById('loginguide-log')
			ll.scrollTop = ll.scrollHeight

		}
	})
}
function query() {
	$.ajax({
		url: SERVERURL + '/api/gamestat?t=' + Math.random(),
		async: false,
		success: function(result) {
			$('#welcome')
				.slideUp()
			gamestatus = parseInt(result.status)
			switch (gamestatus) {
				case 2:
					$('#loginguide').slideUp()
					gaming = false;
					gameend = true;
					break;
				case 1:
					$('#loginguide').slideUp()
					gaming = true;
					gameend = false;
					break;
				case -1:
					$('#loginguide').slideDown()
					loginguide();
					break;
				default:
					$('#loginguide').slideUp()
					gaming = false;
					gameend = false;
			}

			startTime = result.startTime
			section = result.section
			team.teamA.name = result.team.A.name
			team.teamB.name = result.team.B.name

			team.teamA.score = result.team.A.score
			if (team.teamA.score < 0) team.teamA.score = 0
			team.teamB.score = result.team.B.score
			if (team.teamB.score < 0) team.teamB.score = 0

			subtitle = result.message

		},
		error: function(err){
			console.error(err)
		}
	})
}



function applyData() {
	$('#game_section_n')
		.html(section.toString())

	function gamedataDisplay() {
		//Calc Time
		let t = Math.round(new Date()
			.getTime() / 1000) - startTime
		let tmin = parseInt((Math.round(new Date()
			.getTime() / 1000) - startTime) / 60)
		let tsec = t - tmin * 60
		let tmins = tmin.toString()
		if (tmins.length < 2) tmins = '0' + tmins
		let tsecs = tsec.toString()
		if (tsecs.length < 2) tsecs = '0' + tsecs
		$('#timer_M')
			.html(tmins)
		$('#timer_S')
			.html(tsecs)

		//	subtitle
		$('#subtitle')
			.text(subtitle)
		
		//PlayersNd'Score
		$('#teamAname')
			.html(team.teamA.name)
		$('#teamBname')
			.html(team.teamB.name)
		let oldscoreA = parseInt($('#teamAscore')
			.text())
		let oldscoreB = parseInt($('#teamBscore')
			.text())
		if ((oldscoreA != team.teamA.score) || (oldscoreB != team.teamB.score)) {
			let newscoreA = team.teamA.score.toString()
			if (newscoreA.length == 1) newscoreA = '00' + newscoreA
			if (newscoreA.length == 2) newscoreA = '0' + newscoreA
			let newscoreB = team.teamB.score.toString()
			if (newscoreB.length == 1) newscoreB = '00' + newscoreB
			if (newscoreB.length == 2) newscoreB = '0' + newscoreB
			$('#teamAscore')
				.html(newscoreA)
			$('#teamBscore')
				.html(newscoreB)
			if (team.teamA.score > oldscoreA) {
				$("#teamAscore")
					.addClass('boardhl')
				setTimeout(() => {
					$("#teamAscore")
						.removeClass('boardhl')
				}, 5000)
			}
			if (team.teamB.score > oldscoreB) {
				$("#teamBscore")
					.addClass('boardhl')
				setTimeout(() => {
					$("#teamBscore")
						.removeClass('boardhl')
				}, 5000)
			}
			if (team.teamA.score < oldscoreA) {
				$("#teamAscore")
					.addClass('boarddl')
				setTimeout(() => {
					$("#teamAscore")
						.removeClass('boarddl')
				}, 5000)
			}
			if (team.teamB.score < oldscoreB) {
				$("#teamBscore")
					.addClass('boarddl')
				setTimeout(() => {
					$("#teamBscore")
						.removeClass('boarddl')
				}, 5000)
			}
		}

	}
	if (gaming) {
		$('#end')
			.css('opacity', '0')
		$('#waiting-layer')
			.slideUp()
		$('#waiting')
			.css('opacity', '0')
		gamedataDisplay()
	} else if (gameend) {
		$('#end')
			.css('opacity', '1')
	} else {
		//section
		$('#end')
			.css('opacity', '0')
		$('#waiting')
			.css('opacity', '1')
		$('#waiting-layer')
			.slideDown()
	}

}

new Promise((resolve, reject) => {
		setTimeout(() => {
			window.$ = require('jquery')
      resolve()
		}, 3000)
	})
	.then(() => {

		setInterval(() => {
			query();
			applyData()
		}, 200)
	})