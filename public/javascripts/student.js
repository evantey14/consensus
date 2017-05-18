$(document).ready(function(){
  var num_confused = 0;
  var questions = [];
  var sorted_questions = [];

  var $confused = $('#confused');
  var $notconfused = $('#not-confused');
  var $askbutton = $('#show-ask-options');
  var $closeask = $('#close-ask-options');
  var $submitquestion = $('#ask-question');
  var $question = $('#the-question');

  var top_quest = false;

  var socket = io();
  $("#confusion-help").hide();
  $("#confusion-info").hide();
  $("#the-asks").hide();

  // this sends the last section of the url to the server
  socket.emit('initialize', {
    user_type: "student",
    room_identifier: window.location.pathname.substr(window.location.pathname.lastIndexOf("/")+1)
  });

  socket.on('initialize', function(room){
    questions = room.questions;
    num_confused = room.num_confused;

    var copy = questions.slice();
    for (var i = 0; i < questions.length; i++) {
      var current_low_index = 0;
      for (var j = 0; j < copy.length; j++) {
        var q = copy[j];
        if (q.vote <= copy[current_low_index].vote) {
          current_low_index = j;
        }
      }
      sorted_questions[i] = copy[current_low_index];
      copy.splice(current_low_index,1);
    }

    update_questions();
    update_confused();
  });

  // socket handlers
  // TODO: we should keep some state variable so people can't repeatedly click 'confused' and send more messages
  $confused.click(function() {
    socket.emit('confused');

    $("#confused").hide();
    $("#not-confused").toggleClass("toggled");
    $("#confusion-help").show();
    $("#show-ask-options").show();
    $("#ask-options").hide();
    $("#confusion-info").show();
  });

  $notconfused.click(function() {
    socket.emit('not_confused');

    $("#confused").show();
    $("#not-confused").toggleClass("toggled");
    $("#confusion-help").hide();
    $("#confusion-info").hide();
  });

  $questionform = $submitquestion.click(function(e) {
    if(!$question.val()) {
      alert("Type a question!");
      return;
    }
    socket.emit('question', $question.val());
    $question.val(' ');
    return false;
  });

  socket.on('new question', function(q) {
    questions.push(q);

    for (var i = 0; i < sorted_questions.length; i++) {
      if (q.vote <= sorted_questions[i].vote) {
        sorted_questions = sorted_questions.slice(0,i).concat([q], sorted_questions.slice(i));
        break;
      }
      if (i == sorted_questions.length-1) {
        sorted_questions.push(q);
        break;
      }
    }
    if (sorted_questions.length == 0) {
      sorted_questions = [q];
    }

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
    for(var i = 0; i < sorted_questions.length; i++){
      if (i < 3){
        var index = i+1;
        var v = sorted_questions[sorted_questions.length - 1 - i].vote;
        var q = sorted_questions[sorted_questions.length - 1 - i].q;
        $("#tquestion-" + index + ".vote").text("+" + v + "/");
        $("#tquestion-" + index + ".question").text(q);
      }
    }

    for(var i = 0; i < questions.length; i++){
      if (i < 3){
        var index = i+1;
        var v = questions[questions.length - 1 - i].vote;
        var q = questions[questions.length - 1 - i].q;
        $("#rquestion-" + index + ".vote").text("+" + v + "/");
        $("#rquestion-" + index + ".question").text(q);
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
    for (var i = 0; i < 3; i++) {
      var index = i + 1;
      $("#rquestion-" + index + ".vote").show();
      $("#tquestion-" + index + ".vote").hide();
      $("#rquestion-" + index + ".question").show();
      $("#tquestion-" + index + ".question").hide();
    }
  });

  $('#show-top-asks').click(function(){
    $("#the-asks").show();
    for (var i = 0; i < 3; i++) {
      var index = i + 1;
      $("#rquestion-" + index + ".vote").hide();
      $("#tquestion-" + index + ".vote").show();
      $("#rquestion-" + index + ".question").hide();
      $("#tquestion-" + index + ".question").show();
    }
  });

  $('.ui.modal').modal({blurring:true});

  // START QUESTION LOGIC

  $('.question').click(function(el){
    var q = $(this).text();
    var v = 0;
    $("#question-modal").text(q);
    for (var i = 0; i < questions.length; i++) {
      if (questions[i].q == q) {
        v = questions[i].vote;
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
    for (var i = 0; i < questions.length; i++) {
      if (questions[i].q == question) {
        questions[i].vote = questions[i].vote + 1;
      }
    }

    var copy = questions.slice();
    for (var i = 0; i < questions.length; i++) {
      var current_low_index = 0;
      for (var j = 0; j < copy.length; j++) {
        var q = copy[j];
        if (q.vote <= copy[current_low_index].vote) {
          current_low_index = j;
        }
      }
      sorted_questions[i] = copy[current_low_index];
      copy.splice(current_low_index,1);
    }
    update_questions();
  });

  socket.on('resolve', function(question){
    console.log('RESOVLED QUESTION: ' + question)
    if(~questions.indexOf(question)){
      questions.splice(questions.indexOf(question), 1);
    }
    update_questions();
  });

});
