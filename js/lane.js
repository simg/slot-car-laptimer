Lane = {
  
  init:function(id, driver, car, direction) {
    this.id = id;
		this.driver = driver; //app.get_driver_by_id(driver_id);
		this.car = car; //app.get_car_by_id(car_id);
		this.direction = direction;
		this.pole = false;
    this.fastest_laptime = null;
    this.slowest_laptime = null;
    this.average_laptime = null;
    this.start_time = null;
    this.total_time = null;
    this.laptimes = [];
    this.current_lapnum = 0;
    this.finished = false;
    this.bounces = 0;
    this.crashes = 0;
    this.current_abs_laptime = 0;
    this.previous_abs_laptime = 0;
		this.points = 0;
		this.blue_ribbons = 0;
		this.over_takes = 0;
		this.winner = false;
  },
  
  count_lap:function(event) {
		
    if (this.finished) {
      return; // don't count further laps once a track has finished the race
    }

		event.lane = this; //pass the lane details on with any subsequent event handlers
		var other_lane = app.other_lane(app.race, this);		
		
		/* detect who starts in front */
		if (!other_lane.laptimes[this.current_lapnum-1]) {
			//this car in front
			//if (!app.race.in_front) app.race.in_front = this.id;  // deprecate this code
      this.in_front = true;
		}	else {
      this.in_front = false;
    }
    
  	if (this.current_lapnum == 0) {
	    this.start_time = event.time;
	    this.previous_abs_laptime = event.time;
	    this.current_lapnum++;
      app.trigger("race_start", {lane:this})
      app.trigger("first_lap", {lane:this})
      app.trigger("notify_lap", {lane:this})
      if (other_lane.start_time == null) this.pole = true; // this lane when through the gate first
	    return;
    }
    
    /* Calculate current lap time */
    this.current_abs_laptime = event.time
    this.current_laptime = this.current_abs_laptime - this.previous_abs_laptime
    
    /* Save this laptime for the next count */
    this.previous_abs_laptime = this.current_abs_laptime

    /* check for crash or bounce */
    if (this.current_laptime < app.settings.bounce_time) {
      this.bounces++
      return; // false "2nd trigger" so ignore this event	
    }
     if (this.current_laptime > app.settings.crash_time) {
      this.crashes++;
			//this.points += app.settings.points.crash;
			//console.log("crash penalty", this.id);
			
    }
  
    this.last_laptime = this.current_laptime;
    this.laptimes.push(this.current_laptime);
    

    // check for slowest time 
    if (!this.slowest_laptime || this.current_laptime > this.slowest_laptime) {
			this.slowest_laptime = this.current_laptime;
			app.trigger("lane_slowest_lap", event);
		}
  

    // check for fastest time 
    if (this.current_laptime < this.fastest_laptime || this.fastest_laptime == null) 
    {
      this.fastest_laptime = this.current_laptime;	
	    if (this.fastest_laptime != null) {
        app.trigger("lane_fastest_lap",event)
	    }
    }
	
    this.total_time = event.time - this.start_time;	
	  this.average_laptime = this.total_time / this.current_lapnum;
		
		/* check for faster lap than opponent*/
		if (other_lane.laptimes[this.current_lapnum-1]) {
			//other car has completed their lap so we can compare times
			if (other_lane.laptimes[this.current_lapnum-1] > this.current_laptime) {
				//this lap was faster, so give it the point(s)
				this.points += app.settings.points.faster_lap;
				console.log("faster_lap", this.id);
			} else {
				other_lane.points += app.settings.points.faster_lap;
				console.log("faster_lap", other_lane.id);
			}
		}
		
    if (this.in_front && !this.pole) {
      //this lane ahead at line
      this.over_takes++;
      app.trigger("overtake", event);
    }
		
   

    if (this.current_lapnum == (app.settings.race_laps -3)) {
      if (!other_lane.three_laps_to_go) {
        this.three_laps_to_go = true;
        app.trigger("three_laps_to_go", this.id)
      }
    }

    if (this.current_lapnum == (app.settings.race_laps -1)) {
      //if (!other_lane.last_lap) {
        //this.last_lap = true;
        app.trigger("last_lap", this.id)
      //}
    }    
		
    if (this.current_lapnum == app.settings.race_laps) {
			//finished
			
			if (!other_lane.finished) {
				// this car finished first, so give bonus points
				this.winner = true;
				//this.points += app.settings.points.win;
				console.log("win bonus", this.id)
				
			} else {
				if (this.fastest_laptime < other_lane.fastest_laptime) {
					//this.points += app.settings.points.fastest_lap;
					console.log("fastest_lap", this.id)
				} else {
					//other_lane.points += app.settings.points.fastest_lap;
					console.log("fastest_lap", other_lane.id)
				}
			}

			this.finished = true;
			
			if (this.crashes == 0) {
				this.blue_ribbons = 1;
				//this.points += app.settings.points.blue_ribbon;
				console.log("blue_ribbon", this.id)
			}
			
      app.trigger("lane_finished", event)
			
			/*
				//estimate accuracy			
				var total_time = 0
				for (var i=0; i < this.laptimes.length; i++) {
					total_time += this.laptimes[i]
				}
				console.log("accuracy="+(total_time-this.total_time))
			*/
    }

    app.trigger("notify_lap", event)
    this.current_lapnum++;
    app.trigger("scores_changed", event)
  },
}