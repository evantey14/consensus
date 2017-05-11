$(document).ready(function(){
  adj = ["creative", "learning", "quirky", "funky", "cheesy", "extreme",
         "radical", "perky", "pretty", "binary", "hazmat", "doctor",
         "barefoot", "bashful", "colorful", "other", "new", "good", "old", "little",
         "great", "small", "young", "long", "high", "military", "bad", "social",
         "dead", "true", "economic", "open", "early", "free", "national", "strong"];
  sub = ["math", "physics", "pe", "biology", "chemistry", "music", "english",
         "health", "calculus", "french", "spanish"];

  $("#home-button").click(function(){
    var name = $("#room-name").val();
    var chosen = false;
    if(!name){
      name = generateName();
      chosen = true;
    }
    if(chosen){
      $.post("/create", {name: name}, function(resp){
        if(resp == "DONE"){
          $("#create-header").text(name + " has been created");
          $("#create-modal").modal('show');
        }else{
          alert("Choose another name!");
        }
      });
    }else{
      while(true){
          $.post("/create", {name: name}, function(resp){
            if(resp == "DONE"){
              $("#create-header").text(name + " has been created");
              $("#create-modal").modal('show');
              return;
            }else{
              name = generateName();
            }
          });
      }
    }
  });

  generateName = function(){
    var adj1 = adj[Math.floor(Math.random()*adj.length)];
    var adj2 = adj[Math.floor(Math.random()*adj.length)];
    var subj = sub[Math.floor(Math.random()*sub.length)];
    return adj1 + '-' + adj2 + '-' + subj;
  };
});
