race_history = {
  	
  add_race_to_history:function(race, i) {
    //function fastest(a,b) { if (a > b) return b; else return a; }
    
    var row_class = "";
    if ((app.session.races.length - app.active_race) == i) {//TODO: clean this up
      //this is the currently visible race
      row_class = "highlight";
    }
    
    if (i != undefined) {
      var h = '<tr class="'+row_class+'"><td>'+(i+1)+'</td>';  
    } else {
      var h = '<tr class="'+row_class+'"><td>'+(app.session.races.length)+'</td>';  
    }
    
    h += '<td><span class="'+(race.lanes[0].blue_ribbons ? "blue_ribbon":"")+'">'+ race.lanes[0].driver.name + '</span> / <span class="'+(race.lanes[1].blue_ribbons ? "blue_ribbon":"") +'">' + race.lanes[1].driver.name + '</span></td>';
    h += '<td>'+ numeral(race.lanes[0].fastest_laptime).format('0.000') + ' / ' + numeral(race.lanes[1].fastest_laptime).format('0.000')+'</td>';
    h += '<td>'+ numeral(race.lanes[0].average_laptime).format('0.000') + ' / ' + numeral(race.lanes[1].average_laptime).format('0.000')+'</td>';
    h += '<td>'+ numeral(race.lanes[0].total_time).format('0.000') + ' / ' + numeral(race.lanes[1].total_time).format('0.000')+'</td>';
    h += '<td>'+ race.lanes[0].over_takes + ' / ' + race.lanes[1].over_takes+'</td>';
    h += '<td>'+ race.lanes[0].crashes + ' / ' + race.lanes[1].crashes+'</td>';
    h += '<td>'+ (race.lanes[0].winner ? ("1:"+race.lanes[0].driver.name):("2:"+race.lanes[1].driver.name)) +'</td>';
    h += '<td>'+ race.lanes[0].points + ' / ' + race.lanes[1].points+'</td>';
    h += '</tr>';
    
    $("#history_hack table tbody").prepend(h);
  },
  
  change_race:function(event) {
    $("#history_hack tr").removeClass("highlight");
    if (app.active_race > 0) {
      $("#history_hack tr:eq("+(app.active_race)+")").addClass("highlight");
    }
  },
  
  new_race:function(event) {
    this.render(event);
  },
  
  //redraw the history table
  history_changed:function(event) {
    this.render(event);  
  },
	
	scores_changed:function(event) {
		this.render(event);
	},
  
  render:function(event) {
    $("#history_hack table tbody tr").remove();
    for (var i=0; i < app.session.races.length; i++) {
      this.add_race_to_history(app.session.races[i], i);
    }
  },
  
  race_save:function(event) {
		this.add_race_to_history(event.race);
  }
}