session = {
  races:[],
  /*drivers:{

  },
  cars:{
    
  },*/
  lanes:[
    {
      driver:null,
      car:null,
      fastest_laptime:0, fastest_average:0, fastest_total:0},
    {
      driver:null,
      car:null,
      fastest_laptime:0, fastest_average:0, fastest_total:0}
  ],
	
	fastest_laps:{}, fastest_blue_ribbons:{}, fastest_double_blue_ribbons:{},
  
  init:function() {
    //app.session = this;
    console.log("app.session.races", app.session.races)   
    
    this.lanes[0].driver = app.get_driver_by_id("1");
    this.lanes[1].driver = app.get_driver_by_id("2");
    
    this.lanes[0].car = app.get_car_by_id("1");
    this.lanes[1].car = app.get_car_by_id("2");
    
		app.race = Object.create(Race, {}); //TODO: make the race object like the others (able to automatically hook into the events system) and not have to be cloned / copied to start a new race
		app.race.init();	    
    
  },
  
  race_fastest_lap:function(event) {
    if (this.lanes[event.lane.id-1].fastest_laptime == 0 || event.lane.fastest_laptime < this.lanes[event.lane.id-1].fastest_laptime) {
      this.lanes[event.lane.id-1].fastest_laptime = event.lane.fastest_laptime;
      if (this.races.length > 1) {
        // don't do this on the first race //TODO: this creates a hidden bug because you might not want the sound to play but you might want to do other silent actions
        app.trigger("session_fastest_laptime");
      }
    }
  },
  
  race_save:function(event) {
    var lane, session_driver, session;
    this.races.push(event.race);
    
    /*for (var l=0; l < event.race.lanes.length; l++) {
      lane = event.race.lanes[l];
      
      if (this.lanes[lane.id-1].fastest_total == 0 || lane.total_time < this.lanes[lane.id-1].fastest_total) {
        this.lanes[lane.id-1].fastest_total = lane.total_time;
        app.trigger("fastest_total");
      }
      
      if (this.lanes[lane.id-1].fastest_average == 0 || lane.average_laptime < this.lanes[lane.id-1].fastest_average) {
        this.lanes[lane.id-1].fastest_average = lane.average_laptime;
        app.trigger("fastest_average");
      }
      
      if (this.lanes[lane.id-1].fastest_laptime == 0 || lane.fastest_laptime < this.lanes[lane.id-1].fastest_laptime) {
        this.lanes[lane.id-1].fastest_laptime = lane.fastest_laptime;
        if (this.races.length > 100) {
          
          app.trigger("session_fastest_laptime");
        }
      }  
    }*/
		
		//app.trigger("check_fastest_time_scores", event);
  },
}