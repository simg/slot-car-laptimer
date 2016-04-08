graph = {
  init:function(){
    app.bind("race_slowest_lap", this.rescale, this);
    app.bind("race_fastest_lap", this.rescale, this);
    app.bind("first_lap", this.rescale, this);
  },
  
  scale:{
    min:0,
    max:10000,
    mode:1,
    zoom:0.1,
    show_times:false,
    adjusted_rolling_averages:[]
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
  
  new_race:function(event) {
    this.render(event);
  },
  
  change_race:function(event) {
    this.render(event);
  },
  
  driver_changed:function(event) {
    this.render(event);
  },
  
  car_changed:function(event) {
    this.render(event);
  },
  
  render:function(event){
    if ($("#race").length == 0) {
      $("#page").append('<div id="race"><div id="graph"></div><div id="history_hack"><table><thead><tr><th>Race</th><th>Drivers</th><th>Fastest</th><th>Average</th><th>Total</th><th>Overtakes</th><th>Crashes</th><th>Winner</th><th>Points</th></tr></thead><tbody></tbody></table></div></div>')
    }
    this.height = $("#graph").height();
    $("#graph").html('<div class="scale">'+this.draw_scale()+'</div><div class="laps"><ul /></div>')
    for (var i=1; i <= app.settings.race_laps; i++) {
      var h = '<li><div class="stack">' + this.draw_stack(i-1) + '</div>'
      if (i % 5 == 0) {
        h += '<div class="legend">'+i+'</div>'
      }
      h += '</li>'
      $("#graph .laps ul").append(h)
    }
    $("#graph").append(this.adjusted_rolling_averages());
    $("#graph").append(this.fastest_times());
  },
  
  adjusted_rolling_averages:function() {
    var h = '', avg = 0;
    for (var l=0; l < app.race.lanes.length; l++) {
      var avg = app.adjusted_rolling_average(l)
      if (avg > 0) {
        var top = (this.height - parseInt((avg - this.scale.min) / this.scale_per_pixel))
        if (top < 0) top = 0;
        if (top > this.height) top = this.height;
        h += '<div class="average_bar lane_'+app.race.lanes[l].id+'" style="top:'+top+'px; background:'+app.race.lanes[l].driver.color.main+'" />';
      } else {
        // there was no data to calculate an average
      }
    }
    return h;
  },

  fastest_times:function() {
    var h = "";
    var fastest_laptime = app.fastest_laptime();
    console.log("fastest_laptime", fastest_laptime)
    if (fastest_laptime) {
      var top = (this.height - parseInt((fastest_laptime - this.scale.min) / this.scale_per_pixel))
      if (top < 0) top = 0;
      if (top > this.height) top = this.height;
      h += '<div class="average_bar fastest_laptime" style="top:'+top+'px;" />';
    }

    var fastest_blue_ribbon = app.fastest_blue_ribbon_avg();
    if (fastest_blue_ribbon) {
      var top = (this.height - parseInt((fastest_blue_ribbon - this.scale.min) / this.scale_per_pixel))
      if (top < 0) top = 0;
      if (top > this.height) top = this.height;
      h += '<div class="average_bar fastest_blue_ribbon" style="top:'+top+'px;" />';
    }
    return h;
  },
  
  notify_lap:function(event) {
    var this_lap = event.lane.current_lapnum -1 //already on the new lap + 0th counting
    $("#graph .laps ul li:eq("+(this_lap)+") .stack").html(this.draw_stack(this_lap))
  },
  
  draw_stack:function(lapnum){
    var laptimes = app.get_laptimes(lapnum)
    var stack = ''
    var race = (app.active_race == 0) ? app.race : app.session.races[app.session.races.length - app.active_race]; //TODO: make this not suck
    
    for (var i=0; i < laptimes.length; i++) {
      //var lane = app.session.lanes[(laptimes[i].lane_id-1)];
      var lane = race.lanes[(laptimes[i].lane_id-1)];
      var height= parseInt((laptimes[i].time - this.scale.min) / this.scale_per_pixel)
      if (height > this.height) height = this.height
      stack += "<div class=\"lane lane_"+laptimes[i].lane_id+"\" style=\"background:"+lane.driver.color.main+"; border-color:"+lane.driver.color.border+";height:"+height+"px; z-index:"+i+";\">"
      if (this.scale.show_times) {
        if (i == laptimes.length-1) {
          var time = numeral(laptimes[i].time).format('0.000')
        } else {
          var time = "+"+numeral(laptimes[i].time - laptimes[laptimes.length-1].time).format('0.000')
        }
        stack += '<span class="time">'+ time +"</span>"
      }
      //stack += '<span class="time">'+ lapnum +"</span>"
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
    for (var l=0; l < app.race.lanes.length; l++) {
      this.scale.adjusted_rolling_averages[l] = app.adjusted_rolling_average(l);
    }
    switch(this.scale.mode){
      case 1:
        this.scale.min = app.race.fastest_laptime*(1-(this.scale.zoom*.1))
        this.scale.max = app.race.fastest_laptime*(1+this.scale.zoom)
        break      
      case 2:
        this.scale.min = Math.min(this.scale.adjusted_rolling_averages[0], this.scale.adjusted_rolling_averages[1], app.race.fastest_laptime)*0.9; //app.race.fastest_laptime*.9 
        this.scale.max = Math.max(this.scale.adjusted_rolling_averages[0], this.scale.adjusted_rolling_averages[1], app.race.slowest_laptime)*1.1
        break

    }
    this.render()
  }
}