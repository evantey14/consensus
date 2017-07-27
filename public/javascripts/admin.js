$(document).ready(function(){
  var num_confused = 0;
  var questions = [];
  var sorted_questions = [];

  var socket = io();
  socket.emit('initialize', {
    user_type: "admin",
    room_identifier: window.location.pathname.substr(window.location.pathname.lastIndexOf("/")+1)
  });

  socket.on('initialize', function(room) {
    questions = room.questions;
    num_confused = room.num_confused;
    update_questions();
    update_confused();
  });

  // confusion handling
  socket.on('update_confused', function(delta) {
    num_confused += delta;
    update_confused();
  });

  update_confused = function(){
    $('#graph').text(num_confused);
  };

  // question handling
  socket.on('new_question', function(q) {
    questions.push(q);
    update_questions();
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

  update_questions = function() {
    sorted_questions = questions.slice().sort(function(a, b) {
      return a.vote - b.vote;
    });

    $('#recent-asks').empty();
    $('#top-asks').empty();

    for(var i = 1; i <= questions.length; i++) {
      $('<p>', {'class': 'vote', 'id': 'rvote-' + i, 'style': 'font-style:italics; border:none; display:inline-block;'})
        .text('+' + questions[questions.length - i].vote + '/')
        .appendTo('#recent-asks');
      $('<div>', {'class': 'question', 'id': 'rquestion-' + i, 'style': 'display:inline-block;'})
        .text(questions[questions.length - i].q)
        .appendTo('#recent-asks');
      $('<p>').appendTo('#recent-asks'); // for spacing
      
      $('<p>', {'class': 'vote', 'id': 'tvote-' + i, 'style': 'font-style:italics; border:none; display:inline-block;'})
        .text('+' + sorted_questions[sorted_questions.length - i].vote + '/')
        .appendTo('#top-asks');
      $('<div>', {'class': 'question', 'id': 'tquestion-' + i, 'style': 'display:inline-block;'})
        .text(sorted_questions[sorted_questions.length - i].q)
        .appendTo('#top-asks');
      $('<p>').appendTo('#top-asks');
    }
  };
  
  // front end functionality
  $("#button").click(function() {
    $("#show-later").show();
  });

  $('.ui.modal').modal({blurring:true});

  // using .on() to bind this handler to all future .question elements
  $('.questions').on('click', '.question', function(el) {
    $('#question-modal-description').text($(this).text());
    $('#question-modal.modal.ui.basic').modal('show');
  });

  $('#session-links').click(function() {
    $('#session-links-modal.modal.ui').modal('show');
  });

  $('#close-session').click(function() {
    $('#close-session-modal.modal.ui').modal('show');
  });

});
