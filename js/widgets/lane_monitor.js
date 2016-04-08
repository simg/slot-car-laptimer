lane_monitor = {
  init:function(){

  },
	
	notify_lap:function(event) {
		this.render(event);
	},
	
	driver_changed:function(event) {
		this.render(event);
	},
	
	car_changed:function(event) {
		this.render(event);
	},
	
	crash_blame:function(event) {
		this.render(event);
	},
	
	crash_add:function(event) {
		this.render(event);
	},
	
	new_race:function(event) {
		this.render(event);
	},
	
	change_race:function(event) {
		this.render(event);
	},
	
	lane_finished:function(event) {
		this.render(event);
	},
	
	history_changed:function(event) {
		this.render(event);
	},
	
	scores_changed:function(event) {
		this.render(event);
	}, 
	
  render:function(){
		//console.log("lane_monitor.render");
    if ($("#lanes").length == 0) {
      $("#race").append('<div id="lanes"></div>')
    }
    var h = ''
    for (var l=0; l < app.race.lanes.length; l++){
      //var lane = app.race.lanes[l]
      h += this.draw_lane(l)
    }
    $("#lanes").html(h)
  },
  
  draw_lane:function(l) {
    
		var lane, other_lane, driver, other_driver; //todo: this is so clumsy - make it work with potentially more lanes / drivers
		
		lane = app.race.lanes[l];
		session_lane = app.session.lanes[lane.id-1];
		other_lane = app.other_lane(app.race, lane);
		session_other_lane = app.session.lanes[other_lane.id-1];
		
		var h = '<div class="lane lane_'+(l+1)+'"><div class="no" style="color:'+lane.driver.color.main+'">'+(l+1)+'</div>'+
			'<div class="driver">'+
				'<span class="name"><span>'+lane.driver.name+'</span></span>'+
				'<span class="value races"><span>'+lane.driver.races+'</span></span>'+
				'<span class="value blue_ribbons"><span>'+lane.driver.blue_ribbons+'</span></span>'+
				'<span class="value crashes"><span>'+lane.driver.crashes+'</span></span>'+
				'<span class="value points"><span>'+lane.driver.points+'</span></span>'+
			'</div>' +
			'<div class="car">'+
				'<span class="name"><span>'+lane.car.name+'</span></span>'+
				'<span class="value races"><span>'+lane.car.races+'</span></span>'+
				'<span class="value blue_ribbons"><span>'+lane.car.blue_ribbons+'</span></span>'+
				'<span class="value crashes"><span>'+lane.car.crashes+'</span></span>'+
				'<span class="value points"><span>'+lane.car.points+'</span></span>'+
			'</div>' +
			'<dl class="stats">'
    
    //TODO:find a less ugly way to do this
    var display_lap = lane.current_lapnum;
    if (display_lap > app.settings.race_laps) display_lap = app.settings.race_laps
    //var other_lane_display_lap = other_lane.current_lap
    //if (other_lane_display_lap > app.settings.race_laps) other_lane_display_lap = app.settings.race_laps
      
	  h += this.draw_lane_info("Lap",display_lap, (app.settings.race_laps - display_lap), ''); //numeral(lane.laptimes[lane.laptimes.length-1] - other_lane.laptimes[other_lane.laptimes.length-1]).format('0.000'))
	  h += this.draw_lane_info("Last", numeral(lane.last_laptime).format('0.000'),  numeral(lane.last_laptime - other_lane.last_laptime).format('0.000'), numeral(lane.last_laptime - lane.fastest_laptime).format('0.000') )
	  h += this.draw_lane_info("Best", numeral(lane.fastest_laptime).format('0.000'),  numeral(lane.fastest_laptime - other_lane.fastest_laptime).format('0.000'), numeral(lane.fastest_laptime - session_lane.fastest_laptime).format('0.000'))
		h += this.draw_lane_info("Avg",numeral(lane.average_laptime).format('0.000'),  numeral(lane.average_laptime - other_lane.average_laptime).format('0.000'), numeral(lane.average_laptime - session_lane.fastest_average).format('0.000'))
	  h += this.draw_lane_info("Total", numeral(lane.total_time).format('0.000'),  numeral(lane.total_time - other_lane.total_time).format('0.000'), numeral(lane.total_time - session_lane.fastest_total).format('0.000'))
    h += this.draw_lane_info("Crash",lane.crashes,  lane.bounces)
		h += this.draw_lane_info("P/O/W", lane.points,  lane.over_takes, (lane.winner ? "Win":""))
		h += "</dl></div>"
    
    return h
  },
  
  draw_lane_info:function(item, value, other_value, session_value){
		  var h = "<dt>"+item+":</dt><dd><span class=\"value\">" + value + "</span>"
		  h += "<span class=\"other\">"+((other_value > 0)?"+":"")+other_value + "</span>"
      if (session_value) {
        h += "<span class=\"session\">"+((session_value > 0)?"+":"")+session_value + "</span>"
      }
		  h += "</span></dd>"

		  return h
  }  
}