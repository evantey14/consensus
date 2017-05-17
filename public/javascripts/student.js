$(document).ready(function(){
  var num_confused = 0;
  var questions = [];

  var $confused = $('#confused');
  var $notconfused = $('#not-confused');
  var $askbutton = $('#show-ask-options');
  var $closeask = $('#close-ask-options');

  var socket = io();
  $("#confusion-help").hide();
  $("#confusion-info").hide();

  // this sends the last section of the url to the server
  socket.emit('initialize', window.location.pathname.substr(window.location.pathname.lastIndexOf("/")+1));  

  socket.on('initialize', function(room){
    questions = room.questions;
    num_confused = room.num_confused;
    update_questions();
    update_confused();
  });

  // socket handlers
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

  var $submitquestion = $('#ask-question');
  var $question = $('#the-question');

  $questionform = $submitquestion.click(function(e) {
    socket.emit('question', $question.val());
    $question.val(' ');
    return false;
  });

  socket.on('new question', function(q) {
    questions.push(q);
    console.log(questions);
    update_questions();
  });

  socket.on('update_confused', function(change){
    console.log("Confusion change");
    num_confused += change;
    update_confused();
  });

  update_confused = function(){
    if(num_confused == 0){
      $("#the-confused").text("No one is confused right now :)");
    }else if (num_confused == 1){
      $("#the-confused").text("One person is confused right now");
    }else{
      $("#the-confused").text("" + num_confused + " people are confused");
    }
  }
  
  update_questions = function(){
    for(var i = 0; i < questions.length; i++){
      if (i < 3){
        var index = i+1;
        $("#question-" + index).text("- " + questions[questions.length - 1 - i].q);
      }
    }
  };

  // front end functionality
  $askbutton.click(function(){
    $("#ask-options").show();
    $askbutton.hide();
  });

  $closeask.click(function(){
    $("#ask-options").hide();
    $askbutton.show();
  });

  $('#hide-asks').click(function(){
    $("#the-asks").hide();
  });

  $('#show-recent-asks').click(function(){
    $("#the-asks").show();
  });

  $('.ui.modal').modal({blurring:true});

  $('.question').click(function(el){
    var q = $(this).text().substring(2);
    var v = 0;
    $("#question-modal").text(q);
    for (var i = 0; i < questions.length; i++) {
      console.log(q + questions[i].q);
      if (questions[i].q == q) {
        v = questions[i].vote;
        console.log(v);
        break;
      }
    }
    $("#vote-modal").text(v);
    $('.ui.modal.basic').modal('show');
  });

  $('#upvote').click(function(el){
    var question = $("#question-modal").text();
    socket.emit('upvote', question);
  });

  socket.on('upvote_question', function(question) {
    console.log(question + 'here');
    for (var i = 0; i < questions.length; i++) {
      if (questions[i].q == question) {
        questions[i].vote = questions[i].vote + 1;
      }
    }
  });

});
