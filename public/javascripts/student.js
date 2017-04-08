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
}

function notConfuse() {
  $("#confused").toggleClass("disabled");
  $("#not-confused").toggleClass("toggled");
}
