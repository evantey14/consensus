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

  var socket = io();
  $("#confusion-help").hide();
  $("#confusion-info").hide();
  $("#the-asks").hide();

  socket.emit('initialize', {
    user_type: "student",
    room_identifier: window.location.pathname.substr(window.location.pathname.lastIndexOf("/")+1)
  });

  socket.on('initialize', function(room) {
    questions = room.questions;
    num_confused = room.num_confused;
    update_questions();
    update_confused();
  });

  // confusion handling
  $confused.click(function() {
    socket.emit('update_confused', 1);
    $("#confused").hide();
    $("#not-confused").toggleClass("toggled");
    $("#confusion-help").show();
    $("#show-ask-options").show();
    $("#ask-options").hide();
    $("#confusion-info").show();
  });

  $notconfused.click(function() {
    socket.emit('update_confused', -1);
    $("#confused").show();
    $("#not-confused").toggleClass("toggled");
    $("#confusion-help").hide();
    $("#confusion-info").hide();
  });

  socket.on('update_confused', function(delta){
    num_confused += delta;
    update_confused();
  });

  update_confused = function() {
    if(num_confused == 0){
      $("#the-confused").text("No one is confused right now :)");
    }else if (num_confused == 1){
      $("#the-confused").text("One person is confused right now");
    }else{
      $("#the-confused").text("" + num_confused + " people are confused");
    }
  }

  // question handling
  $submitquestion.click(function(e) {
    if(!$question.val()) {
      alert("Type a question!");
    }
    socket.emit('new_question', $question.val());
    $question.val('');
  });

  socket.on('new_question', function(q) {
    questions.push(q);
    update_questions();
  });

  $('#upvote').click(function(el){
    var question = $("#question-modal").text();
    socket.emit('upvote_question', question);
  });

  socket.on('upvote_question', function(question) {
    for (var i = 0; i < questions.length; i++) {
      if (questions[i].q == question) {
        questions[i].vote++;
        break;
      }
    }
    update_questions();
  });

  socket.on('resolve_question', function(question){
    console.log('RESOVLED QUESTION: ' + question)
    if(~questions.indexOf(question)){
      questions.splice(questions.indexOf(question), 1);
    }
    update_questions();
  });

  update_questions = function(){
    sorted_questions = questions.slice().sort(function(a, b) {
      return a.vote > b.vote;
    });
      
    for(var i = 0; i < sorted_questions.length; i++){
      if (i < 5){
        var index = i+1;
        var v = sorted_questions[sorted_questions.length - 1 - i].vote;
        var q = sorted_questions[sorted_questions.length - 1 - i].q;
        $("#tquestion-" + index + ".vote").text("+" + v + "/");
        $("#tquestion-" + index + ".question").text(q);
      }
    }

    for(var i = 0; i < questions.length; i++){
      if (i < 5){
        var index = i+1;
        var v = questions[questions.length - 1 - i].vote;
        var q = questions[questions.length - 1 - i].q;
        $("#rquestion-" + index + ".vote").text("+" + v + "/");
        $("#rquestion-" + index + ".question").text(q);
      }
    }
  }

  // front end functionality
  $askbutton.click(function() {
    $("#ask-options").show();
    $askbutton.hide();
  });

  $closeask.click(function() {
    $("#ask-options").hide();
    $askbutton.show();
  });

  $('#hide-asks').click(function() {
    $("#the-asks").hide();
  });

  // TODO: if we give these all appropriate classes, 
  // this can probably be done more quickly
  $('#show-recent-asks').click(function() {
    $("#the-asks").show();
    for (var i = 0; i < 5; i++) {
      var index = i + 1;
      $("#rquestion-" + index + ".vote").show();
      $("#tquestion-" + index + ".vote").hide();
      $("#rquestion-" + index + ".question").show();
      $("#tquestion-" + index + ".question").hide();
    }
  });

  $('#show-top-asks').click(function() {
    $("#the-asks").show();
    for (var i = 0; i < 5; i++) {
      var index = i + 1;
      $("#rquestion-" + index + ".vote").hide();
      $("#tquestion-" + index + ".vote").show();
      $("#rquestion-" + index + ".question").hide();
      $("#tquestion-" + index + ".question").show();
    }
  });

  $('.ui.modal').modal({blurring:true});

  $('.question').click(function(el) {
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

});
