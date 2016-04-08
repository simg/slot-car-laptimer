points = {
  recalculate_points:function(event) {
    
    app.session.fastest_laps = {};
    app.session.fastest_blue_ribbons = {};
    app.session.fastest_double_blue_ribbons = {};
    app.session.drivers_fastest_laps = {};
    app.session.drivers_fastest_blue_ribbons = {};
    app.session.drivers_fastest_double_blue_ribbons = {};

    //reset points to zero
    for (var i=0; i < app.settings.drivers.length; i++) {
      app.settings.drivers[i].races = 0;
      app.settings.drivers[i].poles = 0;
      app.settings.drivers[i].wins = 0;
      app.settings.drivers[i].blue_ribbons = 0;
      app.settings.drivers[i].double_blue_ribbons = 0;
      app.settings.drivers[i].crashes = 0;
      app.settings.drivers[i].overtakes = 0;
      app.settings.drivers[i].points = 0;
      app.settings.drivers[i].car_lanes = {}
    } 
    for (var i=0; i < app.settings.cars.length; i++) {
      app.settings.cars[i].races = 0;
      app.settings.cars[i].poles = 0;
      app.settings.cars[i].wins = 0;
      app.settings.cars[i].blue_ribbons = 0;
      app.settings.cars[i].double_blue_ribbons = 0;
      app.settings.cars[i].crashes = 0;
      app.settings.cars[i].overtakes = 0;
      app.settings.cars[i].points = 0;
      app.settings.cars[i].lanes = [];
    }

    for (var r=0; r < app.session.races.length; r++){
      var race = app.session.races[r];
      for (var l=0; l < race.lanes.length; l++) {
        var lane = race.lanes[l];
        var other_lane = app.other_lane(race, lane);
        var car_lane_id = lane.car.id+'-'+lane.id;
        
        //reset points for lane (so as to recalculate)
        lane.points = 0;
        
        //ensure suitable arrays exist
        if (!app.session.fastest_laps[car_lane_id]) app.session.fastest_laps[car_lane_id] = [];
        if (!app.session.fastest_blue_ribbons[car_lane_id]) app.session.fastest_blue_ribbons[car_lane_id] = [];
        if (!app.session.fastest_double_blue_ribbons[car_lane_id]) app.session.fastest_double_blue_ribbons[car_lane_id] = [];

        if (!app.session.drivers_fastest_laps[car_lane_id]) app.session.drivers_fastest_laps[car_lane_id] = [];
        if (!app.session.drivers_fastest_blue_ribbons[car_lane_id]) app.session.drivers_fastest_blue_ribbons[car_lane_id] = [];
        if (!app.session.drivers_fastest_double_blue_ribbons[car_lane_id]) app.session.drivers_fastest_double_blue_ribbons[car_lane_id] = [];

        if (!lane.driver.car_lanes[car_lane_id]) lane.driver.car_lanes[car_lane_id] = {races:0, poles:0, wins:0, blue_ribbons:0, double_blue_ribbons:0, crashes:0, overtakes:0, points:0};
        if (!lane.car.lanes[l]) lane.car.lanes[l] = {lane_id:l, races:0, poles:0, wins:0, blue_ribbons:0, double_blue_ribbons:0, crashes:0, overtakes:0, points:0};
        
        lane.driver.races++; //count driver race
        lane.driver.car_lanes[car_lane_id].races++;
        lane.car.races++; //count car race
        lane.car.lanes[l].races++;
        
        //check for race win
        if (lane.winner) {
          lane.driver.wins++;
          lane.driver.car_lanes[car_lane_id].wins++;
          lane.driver.points += app.settings.points.win;
          lane.driver.car_lanes[car_lane_id].points += app.settings.points.win;
          
          lane.car.wins++;
          lane.car.lanes[l].wins++;
          lane.car.points += app.settings.points.win;
          lane.car.lanes[l].points += app.settings.points.win;
  
          lane.points += app.settings.points.win;
        }
        
        if (lane.pole) {
          lane.driver.poles++;
          lane.driver.car_lanes[car_lane_id].poles++;
          lane.car.poles++;
          lane.car.lanes[l].poles++;
        }
        
        //check for over takes
        lane.driver.overtakes += lane.over_takes;
        lane.driver.points += (lane.over_takes * app.settings.points.overtake);
        lane.driver.car_lanes[car_lane_id].overtakes += lane.over_takes;
        lane.driver.car_lanes[car_lane_id].points += (lane.over_takes * app.settings.points.overtake);
      
        lane.car.overtakes += lane.over_takes;
        lane.car.lanes[l].overtakes += lane.over_takes;
        lane.car.points += (lane.over_takes * app.settings.points.overtake);
        lane.car.lanes[l].points += (lane.over_takes * app.settings.points.overtake);
        
        lane.points += (lane.over_takes * app.settings.points.overtake);
        
        
        //check for blue_ribbons
        if (lane.blue_ribbons) {
          lane.driver.blue_ribbons += lane.blue_ribbons;
          lane.driver.points += app.settings.points.blue_ribbon;
          lane.driver.car_lanes[car_lane_id].points += app.settings.points.blue_ribbon;
          lane.driver.car_lanes[car_lane_id].blue_ribbons += lane.blue_ribbons;
          
          lane.car.blue_ribbons++;
          lane.car.points += app.settings.points.blue_ribbon;
          lane.car.lanes[l].blue_ribbons++;
          lane.car.lanes[l].points += app.settings.points.blue_ribbon;
          
          lane.points += app.settings.points.blue_ribbon;
          
          if (other_lane.blue_ribbons) {
            //get more yet more points for double blue ribbon
            lane.driver.double_blue_ribbons += lane.blue_ribbons;
            lane.driver.points += app.settings.points.double_blue_ribbon;
            lane.driver.car_lanes[car_lane_id].points += app.settings.points.double_blue_ribbon;
            lane.driver.car_lanes[car_lane_id].double_blue_ribbons += lane.blue_ribbons;
            
            lane.car.double_blue_ribbons += lane.blue_ribbons;
            lane.car.points += app.settings.points.double_blue_ribbon;
            lane.car.lanes[l].double_blue_ribbons += lane.blue_ribbons;
            lane.car.lanes[l].points += app.settings.points.double_blue_ribbon;
            
            lane.points += app.settings.points.double_blue_ribbon;         
          }
        }
        
        //check for crashes
        lane.driver.crashes += lane.crashes;
        lane.driver.points += (lane.crashes * app.settings.points.crash);
        lane.driver.car_lanes[car_lane_id].points += (lane.crashes * app.settings.points.crash);
        lane.driver.car_lanes[car_lane_id].crashes += lane.crashes;
        
        lane.car.crashes += lane.crashes; 
        lane.car.points += (lane.crashes * app.settings.points.crash);
        lane.car.lanes[l].crashes += lane.crashes;
        lane.car.lanes[l].points += (lane.crashes * app.settings.points.crash);
        
        lane.points += (lane.crashes * app.settings.points.crash);
        
        //add race to sorted list of fastest laptimes (calculate score later)
        //note, we're wrapping the race object in another object to remember which lane the score is attributed to
        app.array_insert_sorted(app.session.fastest_laps[car_lane_id], {lane_id:(l+1), race:race},
          function(a,b) { return a.race.lanes[a.lane_id-1].fastest_laptime - b.race.lanes[b.lane_id-1].fastest_laptime;	}
        );
        
        if (lane.blue_ribbons) {
          //add race to sorted list of fastest blue ribbons (calculate score later)
          app.array_insert_sorted(app.session.fastest_blue_ribbons[car_lane_id], {lane_id:(l+1), race:race},
            function(a,b) {	return a.race.lanes[a.lane_id-1].total_time - b.race.lanes[b.lane_id-1].total_time;	}
          );
          
          //add race to sorted list of fastest double blue ribbons (calculate score later)
          if (other_lane.blue_ribbons) {
            app.array_insert_sorted(app.session.fastest_double_blue_ribbons[car_lane_id], {lane_id:(l+1), race:race},
              function(a,b) {	return a.race.lanes[a.lane_id-1].total_time - b.race.lanes[b.lane_id-1].total_time;	}
            );  
          }
        }
      
      }
    }
    
    //add points for fastest laps & blue ribbons
    for (var c=0; c < app.settings.cars.length; c++) {
      var car = app.settings.cars[c];
      for (var l=0; l < 2; l++) {
        var car_lane_id = car.id + '-' + (l+1);
        
        var fastest_drivers = [];

        //fastest laps
        var car_lane_fastest_laps = app.session.fastest_laps[car_lane_id];
        if (car_lane_fastest_laps) {          
        for (var i=0; i < car_lane_fastest_laps.length; i++) {
            var fastest_lap = car_lane_fastest_laps[i];
            if (fastest_lap) {
              var race = fastest_lap.race;
              var lane = race.lanes[l];
              var other_lane = app.other_lane(race, lane);
              if (fastest_lap.lane_id == (l+1) && fastest_drivers.indexOf(lane.driver.id) == -1 ) {
                //it was this lane that got the fastest_lap and the driver isn't already in the table so add the points
                lane.driver.points += app.settings.points.fastest_laps[fastest_drivers.length];
                lane.driver.car_lanes[car_lane_id].points += app.settings.points.fastest_laps[fastest_drivers.length];
                lane.car.points += app.settings.points.fastest_laps[fastest_drivers.length];
                lane.car.lanes[l].points += app.settings.points.fastest_laps[fastest_drivers.length];
                lane.points += app.settings.points.fastest_laps[fastest_drivers.length];

                fastest_drivers.push(lane.driver.id);
                app.session.drivers_fastest_laps[car_lane_id].push({lane_id:(l+1), race:race});
              }
            }
            if (fastest_drivers.length > app.settings.points.fastest_laps) {
              break;
            }
          }
        }

        //fastest blue ribbons
        fastest_drivers = []; //clear the previous tally of fastest drivers
        var car_lane_fastest_blue_ribbon = app.session.fastest_blue_ribbons[car_lane_id];
        if (car_lane_fastest_blue_ribbon) {
          for (var i=0; i < car_lane_fastest_blue_ribbon.length; i++) {
            var fastest_blue_ribbon = car_lane_fastest_blue_ribbon[i];
            if (fastest_blue_ribbon) {
              var race = fastest_blue_ribbon.race;
              var lane = race.lanes[l];
              if (fastest_blue_ribbon.lane_id == (l+1) && fastest_drivers.indexOf(lane.driver.id) == -1) {
                lane.driver.points += app.settings.points.fastest_blue_ribbons[fastest_drivers.length];
                lane.driver.car_lanes[car_lane_id].points += app.settings.points.fastest_blue_ribbons[fastest_drivers.length];
                lane.car.points += app.settings.points.fastest_blue_ribbons[fastest_drivers.length];
                lane.car.lanes[l].points += app.settings.points.fastest_blue_ribbons[fastest_drivers.length];
                lane.points += app.settings.points.fastest_blue_ribbons[fastest_drivers.length];

                fastest_drivers.push(lane.driver.id);
                app.session.drivers_fastest_blue_ribbons[car_lane_id].push({lane_id:(l+1), race:race});
              }
            }
            if (fastest_drivers.length > app.settings.points.fastest_blue_ribbons) {
              break;
            }            
          }
        }

        //fastest double blue ribbons
        fastest_drivers = []; //clear the previous tally of fastest drivers
        var car_lane_fastest_double_blue_ribbon = app.session.fastest_double_blue_ribbons[car_lane_id];
        if (car_lane_fastest_double_blue_ribbon) {        
          for (var i=0; i < car_lane_fastest_double_blue_ribbon.length; i++) {
            var fastest_double_blue_ribbon = car_lane_fastest_double_blue_ribbon[i];
            if (fastest_double_blue_ribbon) {
              var race = fastest_double_blue_ribbon.race;
              var lane = race.lanes[l];
              if (fastest_double_blue_ribbon.lane_id == (l+1) && fastest_drivers.indexOf(lane.driver.id) == -1) {
                lane.driver.points += app.settings.points.fastest_double_blue_ribbons[fastest_drivers.length];
                lane.driver.car_lanes[car_lane_id].points += app.settings.points.fastest_double_blue_ribbons[fastest_drivers.length];
                lane.car.points += app.settings.points.fastest_double_blue_ribbons[fastest_drivers.length];
                lane.car.lanes[l].points += app.settings.points.fastest_double_blue_ribbons[fastest_drivers.length];
                lane.points += app.settings.points.fastest_double_blue_ribbons[fastest_drivers.length];

                fastest_drivers.push(lane.driver.id);
                app.session.drivers_fastest_double_blue_ribbons[car_lane_id].push({lane_id:(l+1), race:race});                
              }
            }
            if (fastest_drivers.length > app.settings.points.fastest_double_blue_ribbons) {
              break;
            }             
          }
        }        
      }
      
    }
    
    app.trigger("scores_changed");
	}
}