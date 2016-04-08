summary = {
  
  visible:false,
  
  new_race:function(event) {
    this.visible = true; //ensures that "toggle" will make invisible
    this.toggle_summary(event);
  },
  
  toggle_summary:function(event) {
    if (this.visible) {
      $("#summary").hide();
      $("#race").show();
      this.visible = false;
    } else {
      this.render(event);
      $("#summary").show();
      $("#race").hide();
      this.visible = true;
    }
  },
  
  render:function(event) {
    
    //app.points.recalculate_points({}); //TODO: need asynchrnous events so that recalculation can be done via a trigger;
    
    
    if ($("#summary").length == 0) {
      $("#page").append('<div id="summary"></div>');
    }
    
    var h = ''; //'<h2>Racing Summary</h2>';
    
    //h += '<div>Total races: '+app.session.races.length+'</div><br/>';
    
    h += '<div class="driver_summary"><table><thead><tr><th class="name">Driver/Car</th><th>Races</th><th>Poles</th><th>Wins</th><th>BR</th><th>DBR</th><th>Crashes</th><th>Overtakes</th><th>Points</th><th>Points/Race</th></tr></thead>'
    
    //clone the drivers array for sorting
    var drivers = [];
    for (var i=0; i < app.settings.drivers.length; i++) {
      drivers.push(app.settings.drivers[i]);
    }
    
    //sort drivers into points order (highest first)
    drivers.sort(function(a,b){
      var a_ppp = 0, b_ppp = 0;
      if (a.races > 0) a_ppp = (a.points / a.races);
      if (b.races > 0) b_ppp = (b.points / b.races);
      return b_ppp - a_ppp;
    });
    
    for (var d=0; d < drivers.length; d++) {
      var driver = drivers[d];
      if (driver.races == 0) continue; //only show drivers that have raced
      h += '<tr class="driver">';
      h += '<td class="name">' + driver.name + '</td>';
      h += '<td>' + driver.races + '</td>';
      h += '<td>' + driver.poles + '</td>';      
      h += '<td>' + driver.wins + '</td>';
      h += '<td>' + driver.blue_ribbons + '</td>';
      h += '<td>' + driver.double_blue_ribbons + '</td>';
      h += '<td>' + driver.crashes + '</td>';
      h += '<td>' + driver.overtakes + '</td>';
      h += '<td>' + driver.points + '</td>';
      if (driver.races > 0) {
        h += '<td>' + numeral(driver.points / driver.races).format('0.00000') + '</td>';  
      } else {
        h += '<td>0</td>';  
      }
      
      h += '</tr>';
      
      h += this.driver_car_subtotal(driver);
      
    }
    
    h += '</table></div><br/>';
    
    h += '<div class="car_summary"><table><thead><tr><th class="name">Car/Lane</th><th>Races</th><th>Poles</th><th>Wins</th><th>BR</th><th>DBR</th><th>Crashes</th><th>Overtakes</th><th>Points</th><th>Points/Race</th></tr></thead>'
    
    //clone the cars array for sorting
    var cars = [];
    for (var i=0; i < app.settings.cars.length; i++) {
      cars.push(app.settings.cars[i]);
    }
    
    //sort cars into points order (highest first)
    cars.sort(function(a,b){
      var a_ppp = 0, b_ppp = 0;
      if (a.races > 0) a_ppp = (a.points / a.races.length);
      if (b.races > 0) b_ppp = (b.points / b.races.length);
      return b_ppp - a_ppp;
    });
    
    for (var c=0; c < cars.length; c++) {
      var car = cars[c];
      if (car.races == 0) continue;
      h += '<tr class="car">';
      h += '<td class="name">' + car.name + '</td>';
      h += '<td>' + car.races + '</td>';
      h += '<td>' + car.poles + '</td>';
      h += '<td>' + car.wins + '</td>';
      h += '<td>' + car.blue_ribbons + '</td>';
      h += '<td>'+ car.double_blue_ribbons + '</td>';
      h += '<td>' + car.crashes + '</td>';
      h += '<td>' + car.overtakes + '</td>';
      h += '<td>' + car.points + '</td>';
      if (car.races > 0) {
        h += '<td>' + numeral(car.points / car.races).format('0.00000') + '</td>';  
      } else {
        h += '<td>0</td>';  
      }
      
      h += '</tr>';
      
      h += this.car_lane_driver_subtotal(car);
    }
    
    h += '</table></div>';    
    
    $("#summary").html(h);
  },
  
  driver_car_subtotal:function(driver) {
    
    var h = '';
    
    for (var c=0; c < app.settings.cars.length; c++) {
      var car = app.settings.cars[c];
      for (var l=0; l < 2; l++) {
        //var summary = car_summary[car.id+"-"+l];
        var summary = driver.car_lanes[car.id+"-"+(l+1)];
        if (!summary || summary.races == 0) continue; // only show cars this driver has raced
        h += '<tr class="driver_car">';
        h += '<td>' + car.name + ' ('+(l+1)+')' +'</td>';
        h += '<td>' + summary.races + '</td>';
        h += '<td>' + summary.poles + '</td>';        
        h += '<td>' + summary.wins + '</td>';
        h += '<td>' + summary.blue_ribbons + '</td>';
        h += '<td>' + summary.double_blue_ribbons + '</td>';
        h += '<td>' + summary.crashes + '</td>';
        h += '<td>' + summary.overtakes + '</td>';
        h += '<td>' + summary.points + '</td>';
        if (summary.races > 0) {
          h += '<td>' + numeral(summary.points / summary.races).format('0.00000') + '</td>';  
        } else {
          h += '<td>0</td>';  
        }
        h += '</tr>';
        

      }
    }
    return h;    
  },
  
  car_lane_driver_subtotal:function(car) {
  
    var h = '';
    for (var l=0; l < 2; l++) {
      /*var summary = car_lane_summary[car.id+"-"+l];
      summary.fastest_laps.sort(function(a,b) {
        return a.lanes[summary.lane_id].fastest_laptime - b.lanes[summary.lane_id].fastest_laptime;
      });
      summary.fastest_total.sort(function(a,b) {
        return a.lanes[summary.lane_id].total_time - b.lanes[summary.lane_id].total_time;
      });*/
      var summary = car.lanes[l];
      if (!summary || summary.races == 0) continue; // only show cars this driver has raced
      h += '<tr class="car_lane">';
      h += '<td>' + (summary.lane_id+1) + '</td>';
      h += '<td>' + summary.races + '</td>';
      h += '<td>' + summary.poles + '</td>';
      h += '<td>' + summary.wins + '</td>';
      h += '<td>' + summary.blue_ribbons + '</td>';
      h += '<td>' + summary.double_blue_ribbons + '</td>';
      h += '<td>' + summary.crashes + '</td>';
      h += '<td>' + summary.overtakes + '</td>';
      h += '<td>' + summary.points + '</td>';
      if (summary.races > 0) {
        h += '<td>' + numeral(summary.points / summary.races).format('0.00000') + '</td>';  
      } else {
        h += '<td>0</td>';  
      }
      h += '</tr>';
      
      h += '<tr><td colspan="9">';
      
      
      h +='<div class="car_lane_summary">';
      
      h += '<div class="fastest fastest_laps"><h4>Fastest Laps</h4><table>' +
        '<thead><tr><th>R#</th><th>Driver</th><th>Time</th></tr></thead>'
      
      var car_lane_id = car.id + '-' + (l+1);
      
      var car_lane_fastest_laps = app.session.drivers_fastest_laps[car_lane_id];
      for (var r=0; r < car_lane_fastest_laps.length; r++) {
        //if (r > 2) break;
        var race = car_lane_fastest_laps[r].race;
        var lane = race.lanes[car_lane_fastest_laps[r].lane_id-1];
        h += '<tr>' +
          '<td>' + race.id + '</td>' +
          '<td>' + lane.driver.name + '</td>' +
          '<td>' + numeral(lane.fastest_laptime).format('0.000') + '</td>' +
          '</tr>';
      }
      h += '</table></div>';
      
      h +='<div class="fastest fastest_totals"><h4>Fastest Blue Ribbons</h4><table>' +
        '<thead><tr><th>R#</th><th>Driver</th><th>Time</th></tr></thead>';
      var car_lane_fastest_blue_ribbons = app.session.drivers_fastest_blue_ribbons[car_lane_id];
      for (var r=0; r < car_lane_fastest_blue_ribbons.length; r++) {
        if (r > 2) break;
        var race = car_lane_fastest_blue_ribbons[r].race;
        var lane = race.lanes[car_lane_fastest_blue_ribbons[r].lane_id-1];
        h += '<tr>' +
          '<td>' + race.id + '</td>' +
          '<td>' + lane.driver.name + '</td>' +
          '<td>' + numeral(lane.total_time).format('0.000') + '</td>' +
          '</tr>';
      }
      h += '</table></div>';
      
      h +='<div class="fastest fastest_double_blue_ribbons"><h4>Fastest Double Blue Ribbons</h4><table>' +
        '<thead><tr><th>R#</th><th>Driver</th><th>Time</th></tr></thead>';
      var car_lane_fastest_double_blue_ribbons = app.session.drivers_fastest_double_blue_ribbons[car_lane_id];
      for (var r=0; r < car_lane_fastest_double_blue_ribbons.length; r++) {
        if (r > 2) break;
        var race = car_lane_fastest_double_blue_ribbons[r].race;
        var lane = race.lanes[car_lane_fastest_double_blue_ribbons[r].lane_id-1];
        h += '<tr>' +
          '<td>' + race.id + '</td>' +
          '<td>' + lane.driver.name + '</td>' +
          '<td>' + numeral(lane.total_time).format('0.000') + '</td>' +
          '</tr>';
      }
      h += '</table></div>';
      
      h +='</div></td></tr>';

    }
    return h;    
  },
}