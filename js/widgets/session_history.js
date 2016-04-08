history = {
  init:function(){
  },
  
  scale:{
    min:0,
    max:10000,
    mode:1,
    zoom:0.1,
    show_times:false,
  },
  
  new_race:function(event) {
    this.render(event);
  },
  
  toggle_scale_mode:function(){
    this.scale.mode++
    if (this.scale.mode > 2) this.scale.mode = 1
    this.rescale()
  },
  
  toggle_show_times:function(){
    if (this.scale.show_times == true)
      this.scale.show_times = false
    else
      this.scale.show_times = true
    this.rescale()
  },
  
  scale_zoom_in:function(){
    this.scale.zoom = this.scale.zoom-0.01
    this.rescale()
  },
  scale_zoom_out:function(){
    this.scale.zoom = this.scale.zoom+0.01
    this.rescale()
  },
  
  render:function(){
    if ($("#history").length == 0) {
      $("#page").append('<div id="history"></div>')
    }
    this.height = $("#history").height();
    $("#history").html('<div class="scale">'+this.draw_scale()+'</div><div class="laps"><ul /></div>')
    for (var i=1; i <= app.settings.race_laps; i++) {
      var h = '<li><div class="stack">' + this.draw_stack(i) + '</div>'
      if (i % 5 == 0) {
        h += '<div class="legend">'+i+'</div>'
      }
      h += '</li>'
      $("#history .laps ul").append(h)
    }
  },
  
  add_race:function(event) {
    var this_race = app.session.races.length; //already on the new lap + 0th counting
    $("#history .laps ul li:eq("+(this_race)+") .stack").html(this.draw_stack(this_race))
  },
  
  draw_stack:function(lap){
    var racetimes = app.get_racetimes()
    var stack = ''
    for (var i=0; i < laptimes.length; i++) {
      var height= parseInt((laptimes[i].time - this.scale.min) / this.scale_per_pixel)
      if (height > this.height) height = this.height
      stack += "<div class=\"lane lane_"+laptimes[i].lane_id+"\" style=\"height:"+height+"px; z-index:"+i+";\">"
      if (this.scale.show_times) {
        if (i == laptimes.length-1) {
          var time = numeral(laptimes[i].time).format('0.000')
        } else {
          var time = "+"+numeral(laptimes[i].time - laptimes[laptimes.length-1].time).format('0.000')
        }
        stack += '<span class="time">'+ time +"</span>"
      }
      stack += "</div>"
    }
    return stack
  },
  
  draw_scale:function(){
    var h = '<ul>'
    var scale_range = this.scale.max - this.scale.min
    this.scale_per_pixel =  scale_range / this.height 
    
    for (var i=0; i < 6; i++) {
      if (i == 0) scale_val = this.scale.min
      else if (i == 5) scale_val = this.scale.max
      else scale_val = this.scale.min+(i*scale_range/5)
      var scale_pos = this.height-parseInt((scale_val-this.scale.min)/this.scale_per_pixel)
      if (scale_pos > this.height) scale_pos = this.height
      h += '<li style="top:'+scale_pos+'px;"><span class="val">'+numeral(scale_val).format('0')+'</span><span class="marker"></span></li>'
    }
    h += '</ul>'
    return h
  },
  
  rescale:function(){
    //console.log("rescale",this.scale.zoom)
    if (app.race.fastest_laptime == null) return; // first lap so no data
    switch(this.scale.mode){
      case 1:
        this.scale.min = app.race.fastest_laptime*(1-(this.scale.zoom*.1))
        this.scale.max = app.race.fastest_laptime*(1+this.scale.zoom)
        break      
      case 2:
        this.scale.min = app.race.fastest_laptime*.9
        this.scale.max = app.race.slowest_laptime*1.1
        break

    }
    this.render()
  }
}