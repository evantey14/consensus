$(document).ready(function(){
  adj = ["creative", "learning", "quirky", "funky", "cheesy", "extreme",
         "radical", "perky", "pretty", "binary", "hazmat", "doctor",
         "barefoot", "bashful", "colorful", "other", "new", "good", "old", "little",
         "great", "small", "young", "long", "high", "military", "social",
         "true", "economic", "open", "early", "free", "national", "strong"];
  sub = ["math", "physics", "pe", "biology", "chemistry", "music", "english",
         "health", "calculus", "french", "spanish"];

  $("#home-button").click(function(){
    // TODO: we should validate that these names are ok to use as student links
    var name = $("#room-name").val();
    var chosen = false;

    if(!name){
      name = generateName();
      chosen = true;
    }
    $.post("/create", {name: name})
      .done(function(resp){
      if (!resp) return alert("Choose another name!");
      else {
        $("#create-header").text(name + " has been created");
        $("#student-link").attr('href', "/room/" + resp.student_url);
        $("#admin-link").attr('href', "/admin/" + resp.admin_url);
        $("#create-modal").modal('show');
      }
    })
     .fail(function(){
       alert("Choose another name!");
     });

    // TODO: in we're generating a name, we should keep trying until it works (some code for this can be found below)
    /*if(chosen){
      $.post("/create", {name: name}, function(resp){
        if(resp == "DONE"){
          console.log(resp);
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
    }*/
  });

  $("#room-name").on('keyup', function(e){
    if (e.keyCode == 13){
      $("#home-button").click();
      e.preventDefault();
      return false;
    }
  });

  generateName = function(){
    var adj1 = adj[Math.floor(Math.random()*adj.length)];
    var adj2 = adj[Math.floor(Math.random()*adj.length)];
    var subj = sub[Math.floor(Math.random()*sub.length)];
    return adj1 + '-' + adj2 + '-' + subj;
  };
});
