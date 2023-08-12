

const SERVERURL = "http://127.0.0.1:10721";	// 服务器地址
var gaming = false	
var gameend = false
var startTime = 0;	//	比赛开始时间
var section = 0	//	比赛场次
var team = {	//	各队数据
	teamA: {
		name: "A",
		score: 0
	},
	teamB: {
		name: "B",
		score: 0
	}
}
var sfx = false	//	音效
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
//	引导用户登录控制台
function loginguide(){
	$.ajax({
		url: SERVERURL + '/api/getcontrolpanel?t=' + Math.random(),
		async: false,
		success: function(result) {
			$('#loginguide-qr')[0].src = result.qr;
			$('#loginguide-url').text(result.url)
			$('#loginguide-verifycode').text(result.verifycode)

			//	提取日志
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
//	查询赛事数据（轮询）
function query() {
	$.ajax({
		url: SERVERURL + '/api/gamestat?t=' + Math.random(),
		async: false,
		success: function(result) {
			$('#welcome')
				.slideUp()
			gamestatus = parseInt(result.status)
			sfx = result.sfx ?? false
			switch (gamestatus) {
				case 2:
					$('#loginguide').slideUp()
					//	比赛开始音效
					if(gaming && !gameend && sfx)new Audio('./static/sfx/gameEnd.wav').play()
					gaming = false;
					gameend = true;
					break;
				case 1:
					$('#loginguide').slideUp()
					//	比赛开始音效
					if(!gaming && sfx)new Audio('./static/sfx/gameStart.wav').play()
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


//	应用赛事数据
function applyData() {
	$('#game_section_n')
		.html(section.toString())

	function gamedataDisplay() {
		//	根据时间戳计算比赛时长
		let t = Math.round(new Date()
			.getTime() / 1000) - (startTime/1000)
		let tmin = parseInt((Math.round(new Date()
			.getTime() / 1000) - (startTime/1000)) / 60)
		let tsec = parseInt(t - tmin * 60)
		let tmins = tmin.toString()
		if (tmins.length < 2) tmins = '0' + tmins
		let tsecs = tsec.toString()
		if (tsecs.length < 2) tsecs = '0' + tsecs
		$('#timer_M')
			.html(tmins)
		$('#timer_S')
			.html(tsecs)

		//	小标题
		$('#subtitle')
			.text(subtitle)
		
		//	队伍分数
		$('#teamAname')
			.html(team.teamA.name)
		$('#teamBname')
			.html(team.teamB.name)
		let oldscoreA = parseInt($('#teamAscore')
			.text())
		let oldscoreB = parseInt($('#teamBscore')
			.text())
		//	加扣分
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

			//	加分时的动效以及音效
			if (team.teamA.score > oldscoreA) {
				if(sfx && team.teamA.score == oldscoreA + 1)new Audio('static/sfx/scoreUp.wav').play()
				if(sfx && team.teamA.score > oldscoreA + 1)new Audio('static/sfx/scoreUp++.wav').play()
				$("#teamAscore")
					.addClass('boardhl')
				setTimeout(() => {
					$("#teamAscore")
						.removeClass('boardhl')
				}, 5000)
			}
			if (team.teamB.score > oldscoreB) {
				if(sfx && team.teamB.score == oldscoreB + 1)new Audio('static/sfx/scoreUp.wav').play()
				if(sfx && team.teamB.score > oldscoreB + 1)new Audio('static/sfx/scoreUp++.wav').play()
				$("#teamBscore")
					.addClass('boardhl')
				setTimeout(() => {
					$("#teamBscore")
						.removeClass('boardhl')
				}, 5000)
			}
			//	扣分时的动效以及音效
			if (team.teamA.score < oldscoreA) {
				if(sfx)new Audio('static/sfx/scoerLose.wav').play()
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