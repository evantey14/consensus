$(document).ready(function(){
  var num_confused = 0;
	var $confused = $('#confused');
	var $notconfused = $('#not-confused');

	var socket = io.connect('http://localhost:3000');

	// TODO: we should keep some state variable so people can't repeatedly click 'confused' and send more messages
	$confused.click(function() {
		socket.emit('confused');

    $("#confused").toggleClass("disabled");
    $("#not-confused").toggleClass("toggled");
	});

	$notconfused.click(function() {
		socket.emit('not_confused');

    $("#confused").toggleClass("disabled");
    $("#not-confused").toggleClass("toggled");
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
		questions.push(q);
		console.log(questions);
	});

  socket.on('update_confused', function(change){
    console.log("Confusion change");
    num_confused += change;
    $("#the-confused").text("" + num_confused + " people are also confused");
  })
});
