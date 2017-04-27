$(document).ready(function(){
  var num_confused = 0;
	var questions = [];

	var $confused = $('#confused');
	var $notconfused = $('#not-confused');
  var $askbutton = $('#show-ask-options');
  var $closeask = $('#close-ask-options');

	var socket = io.connect('http://localhost:3000');
  $("#confusion-help").hide();
  $("#confusion-info").hide();

	// TODO: we should keep some state variable so people can't repeatedly click 'confused' and send more messages
	$confused.click(function() {
		socket.emit('confused');

    $("#confused").toggleClass("disabled");
    $("#not-confused").toggleClass("toggled");
    $("#confusion-help").show();
    $("#show-ask-options").show();
    $("#ask-options").hide();
    $("#confusion-info").show();
	});

	$notconfused.click(function() {
		socket.emit('not_confused');

    $("#confused").toggleClass("disabled");
    $("#not-confused").toggleClass("toggled");
    $("#confusion-help").hide();
    $("#confusion-info").hide();
	});

  $askbutton.click(function(){
    $("#ask-options").show();
    $askbutton.hide();
  });

  $closeask.click(function(){
    $("#ask-options").hide();
    $askbutton.show();
  })


	var $submitquestion = $('#ask-question');
	var $question = $('#the-question');

	$questionform = $submitquestion.click(function(e) {
		socket.emit('question', $question.val());
		$question.val(' ');
		return false; // not sure why this is here
	});

	socket.on('new question', function(q) {
		questions.push(q);
		console.log(questions);
    update_questions();
	});

  socket.on('update_confused', function(change){
    console.log("Confusion change");
    num_confused += change;
    if(num_confused == 0){
      $("#the-confused").text("No one is confused right now :)");
    }else if (num_confused == 1){
      $("#the-confused").text("One person is confused right now");
    }else{
      $("#the-confused").text("" + num_confused + " people are confused");
    }
  });

  update_questions = function(){
    for(var i = 0; i < questions.length; i++){
      if (i < 3){
        var index = i+1;
        $("#question-" + index).text("- " + questions[questions.length - 1 - i]);
      }
    }
  };


  update_questions();
});
