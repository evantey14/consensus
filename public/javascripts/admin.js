$(document).ready(function(){
  var socket = io.connect('http://localhost:3000');

  var data = [ { x: 0, y: 40 }, { x: 1, y: 49 }, { x: 2, y: 17 }, { x: 3, y: 42 } ];


  var e = {
        element: document.querySelector("#graph"),
        width: 580,
        height: 250,
        series: [ {
                color: 'steelblue',
                data: data
        } ]
  };

  var graph = new Rickshaw.Graph(e);

  graph.render();


  $("#button").click(function(){
    $("#show-later").show();
  })

  socket.on("update_confused", function(change){
  	console.log("admin notified");

  	data.push({x: 4, y: 17});

  	graph.update();

	graph.render();
  });
});
