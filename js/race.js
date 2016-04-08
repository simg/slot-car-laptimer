Race = {
  fastest_laptime:null,
  slowest_laptime:null,
  finished:false,
  in_front:undefined,
  
  init:function(event) {
    this.lanes = [
      Object.create(Lane),
      Object.create(Lane)
    ];
    this.lanes[0].init(1, app.session.lanes[0].driver, app.session.lanes[0].car);
    this.lanes[1].init(2, app.session.lanes[1].driver, app.session.lanes[1].car);
    this.id = app.next_race_id; //TODO: this smells
    
    app.bind_replace("lane_slowest_lap", this.lane_slowest_lap, this, "race");
    app.bind_replace("lane_fastest_lap", this.lane_fastest_lap, this,"race");
    app.bind_replace("lane_finished", this.lane_finished, this, "race");
  },

  lane_slowest_lap:function(event) {
    if (!this.slowest_laptime || event.lane.current_laptime > this.slowest_laptime) {
      this.slowest_laptime = event.lane.current_laptime
      app.trigger("race_slowest_lap", {lane:this})
    }
  },
  
  lane_fastest_lap:function(event) {
    if (!this.fastest_laptime || event.lane.current_laptime < this.fastest_laptime) {
      this.fastest_laptime = event.lane.current_laptime;
      app.trigger("race_fastest_lap", event)
    }  
  },
  
  lane_finished:function(event) {
    if (app.other_lane(app.race, event.lane).finished) {
      this.finished = true;
      app.trigger("race_finished", event);
    }
  },
    
  new_race:function(event) {

  },

  race_finished:function() {
    this.finished = true;
  },
}