$(document).ready(function(){
  var questions = [];

  var socket = io.connect('http://localhost:3000');

  $("#button").click(function(){
    $("#show-later").show();
  })

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
