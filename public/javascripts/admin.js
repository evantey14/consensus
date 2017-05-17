$(document).ready(function(){

  var questions = [];
  var num_confused = 0;

  var socket = io();
  socket.emit('initialize', window.location.pathname.substr(window.location.pathname.lastIndexOf("/")+1));

  socket.on('initialize', function(room){
    questions = room.questions;
    num_confused = room.num_confused;
    update_questions();
    update_confused();
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

  update_questions = function(){
    // TODO: fill with appropriate behavior
  }

  update_confused = function(){
    // TODO: fill with appropriate behavior
  }

  // front end functionality
  $("#button").click(function(){
    $("#show-later").show();
  })

  socket.on("update_confused", function(change){
  	console.log("admin notified");

  	data.push({x: 4, y: 17});

  	graph.update();

	graph.render();
  });

  $('.ui.modal').modal({blurring:true});

  $('.question').click(function(el){
    $("#question-in-modal").text($(this).text());
    $('#question-modal.modal.ui.basic').modal('show');
  });

  $('#session-links').click(function(){
    $('#session-links-modal.modal.ui').modal('show');
  })

  $('#close-session').click(function(){
    $('#close-session-modal.modal.ui').modal('show');
  })

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
