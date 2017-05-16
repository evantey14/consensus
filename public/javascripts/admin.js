$(document).ready(function(){
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
});
