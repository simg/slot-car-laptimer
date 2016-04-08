notify = {
  init:function(){

  },
  
  render:function(){
    //console.log("notify_render")
    /*if ($("#notify").length == 0) {
      $("#race").append('<div id="notify"><ul /></div>')
    } else {
      $("#notify").html('<ul />')
    }*/
  },
  
  new_race:function(event) {
    this.render();
  },
  
  notify_lap:function(event) {
    //console.log("notify_lap", event)
    //$("#notify ul").prepend("<li>lane "+event.lane.id+" lap "+event.lane.current_lapnum +" time "+numeral(event.lane.current_laptime).format('0.000')+"</li>")
  }
  
}