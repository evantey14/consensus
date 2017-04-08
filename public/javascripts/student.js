$(document).ready(function(){
  //unclear
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
