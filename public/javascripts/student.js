$(document).ready(function(){
	var $confused = $('#confused');
	var $notconfused = $('#not-confused');

	var socket = io.connect('http://localhost:3000');

	// TODO: we should keep some state variable so people can't repeatedly click 'confused' and send more messages
	$confused.click(function() {
		socket.emit('confused');
		// TODO: change to confused screen
	});
	$notconfused.click(function() {
		socket.emit('notconfused');
		// TODO: move to not-confused screen
	});

	var $submitquestion = $('#ask-question');
	var $question = $('#the-question');

	$questionform = $submitquestion.click(function(e) {
		socket.emit('question', $question.val());
		$question.val(' ');
		return false; // not sure why this is here
	});

	var questions = [];

	socket.on('new question', function(q) {
		questions.append(q);
		console.log(questions);
	});
});



function amConfuse() {
  console.log("Clicked");
  $("#confused").toggleClass("disabled");
  $("#not-confused").toggleClass("toggled");
  $("#confused-options").toggleClass("toggled");
  $("#the-confused").toggleClass("toggled");
}

function notConfuse() {
  $("#confused").toggleClass("disabled");
  $("#not-confused").toggleClass("toggled");
  $("#confused-options").toggleClass("toggled");
  $("#the-confused").toggleClass("toggled");
  if ($("#ask-options").hasClass("toggled")) {
    $("#ask-options").removeClass("toggled");
    $("#show-ask-options").removeClass("toggled");
  };
}

function qOptions() {
  $("#ask-options").addClass("toggled");
  $("#show-ask-options").addClass("toggled");
}

function cOptions() {
  $("#ask-options").removeClass("toggled");
  $("#show-ask-options").removeClass("toggled");
}

function topAsks() {
  $("#top-asks").addClass("selected");
  $("#recent-asks").removeClass("selected");
  $("#asks").addClass("toggled");
}

function recAsks() {
  $("#top-asks").removeClass("selected");
  $("#recent-asks").addClass("selected");
  $("#asks").addClass("toggled");
}

function hideAsks() {
  $("#top-asks").removeClass("selected");
  $("#recent-asks").removeClass("selected");
  $("#asks").removeClass("toggled");
}
