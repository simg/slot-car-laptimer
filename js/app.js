app = {
  events:[],
  settings:{
    race_laps:25,
    bounce_time:2000,
    crash_time:10000,
		drivers:[
			{id:1, name:"Ian", color:"#4f4"}, //#4f4
			{id:2, name:"Adrian", color:"#f44"}, //#f44
			{id:3, name:"Simon", color:"#44f"},
			{id:4, name:"John", color:"#A611DA"}
		],
		cars:[
      {id:1, name:"Red"},
      {id:2, name:"Yellow"},
			{id:3, name:"Silver"},
			{id:4, name:"White"},
			{id:5, name:"Blue"},
      {id:6, name:"Black"},
      {id:7, name:"Green"},
      {id:8, name:"Orange"},
      {id:9, name:"Light Blue"},
      {id:0, name:"Pink"},
		],
		points:{
			crash:-10,
			overtake:3,
			faster_lap:0,
			fastest_lap:10,
			win:25,
			blue_ribbon:20,
			double_blue_ribbon:10,
			fastest_blue_ribbons:[75, 40, 10],
			fastest_double_blue_ribbons:[25, 10, 5],
			fastest_laps:[75, 40, 10]
		},
		dev_mode:false,
  },
	active_race:0,
	next_race_id:1, //TODO: technical debt building up
	session:{},

  bind:function(name, callee, context, callee_name) {
    if (!this.events[name]) this.events[name] = []
    this.events[name].push({callee:callee, context:context, name:callee_name})
  },

	bind_replace:function(name, callee, context, callee_name) {
    if (!this.events[name]) this.events[name] = [];
		for (var i=0; i < this.events[name].length; i++) {
			if (this.events[name][i].name == callee_name) {
				//this event needs to be replaced
				this.events[name][i] = {callee:callee, context:context, name:callee_name};
				return; // only going to replace one event/action so return
			}
		}
		//no event to replace, so add instead
    this.events[name].push({callee:callee, context:context, name:callee_name})
  },

  trigger:function(name, event) {
    if (app.events[name]) {
			//console.log("event: "+name, event)
      app.events[name].forEach(function(action){
				var fname = action.toString();
				if (app.debug) console.log("event", name + "->"+ action.name);
				//console.log("callee", fname.substr(8, fname.indexOf('(') )); //log callee function name
        if (action.context != undefined) {
          if (action.callee.apply(action.context, [event])) exit; // if returns true then cancel further event processing
        } else {
          if (action.callee(event)) exit;
        }
      })
    }
  },

	bindKey:function(key, callee, context) {

	},

	//bind each function on the source object to an event with the same name
	load:function(obj, obj_name, replace_mode) {
		//console.log("loading object", obj)
		for (prop in obj) {
			//if is a method of the local object (ie don't bind to properties or propotype methods)
			if(obj.hasOwnProperty(prop) && typeof obj[prop] === 'function') {
				if (!replace_mode)
					app.bind(prop,obj[prop],obj,obj_name);
				else
					app.bind_replace(prop,obj[prop],obj,obj_name);
			}
		}
		app[obj_name] = obj;
	},

	// initialise the application
  app:function(){

		if (app.settings.dev_mode) {
			app.settings.race_laps = 5;
			app.settings.bounce_time = 20;
	    app.settings.crash_time = 2000;
		}

		this.load(this, "app"); // :)
		this.load(session, "session"); //app.session = session;
		this.load(menu, "menu");
		this.load(race_history, "race_history");
		this.load(graph, "graph");
		this.load(lane_monitor, "lane_monitor");
		this.load(sounds, "sounds");
		this.load(change_settings, "change_settings");
		this.load(notify, "notify");
		this.load(summary, "summary");
		this.load(points, "points");

		app.trigger("init", {});

    $(document).keydown(function(event){
			event.time = window.performance.now();
			app.trigger("keypress", event);
		});

		app.trigger("new_race", event);
  },

	init:function(event) {



		//load drivers (currently convert from object literal data format to real object with methods)
		for (var i=0; i < app.settings.drivers.length; i++) {
			var driver = Object.create(Driver, {});
			driver.init(app.settings.drivers[i]);
			var main_color = net.brehaut.Color(driver.color);
			var border_color = main_color.darkenByAmount(0.4);
			driver.color = {main:main_color, border:border_color};
			app.settings.drivers[i] = driver; //TODO: make this load from a database (or something)
		}

		//load cars (currently convert from object literal data format to real object with methods)
		for (var i=0; i < app.settings.cars.length; i++) {
			var car = Object.create(Car, {});
			car.init(app.settings.cars[i]);
			app.settings.cars[i] = car; //TODO: make this load from a database (or something)
		}

	},

  new_race:function(event) {

		if (app.race && app.race.finished && app.active_race == 0) {
			//push summary of any previous race into session history
      console.log("race_save triggered")
			event.race = this.race;
      app.next_race_id++; //only increment race counter if race was finished and logged
			app.trigger("race_save", event);
			app.trigger("recalculate_points");
		}

		app.active_race = 0;

		app.race = Object.create(Race, {}); //TODO: make the race object like the others (able to automatically hook into the events system) and not have to be cloned / copied to start a new race
		app.race.init();

  },

	//assign an existing crash to a particular lane
  /*crash_blame:function(event) {
		var lane, other_lane;

		//determine which race / lane - needs to be refactored
		if (app.active_race == 0) {
			lane = app.race.lanes[event.key-1];
			other_lane = app.other_lane(app.race, lane);
		} else {
			lane = app.session.races[app.session.races.length - app.active_race].lanes[event.key-1]; //TODO: get rid of this crazy negative counting
			other_lane = app.session.races[app.session.races.length - app.active_race].lanes[app.other_lane_id(event.key)-1];
		}


    if (other_lane.crashes > 0) {
			other_lane.crashes--;
			other_lane.points -= app.settings.points.crash;
			if (other_lane.finished) {
				//race is already finished, so adjust blue ribbon points if necessary
				if (other_lane.crashes == 0) {
					if (other_lane.blue_ribbons == 0) {
						//since crashes are zero, driver deserves blue ribbon
						other_lane.blue_ribbons = 1;
						other_lane.points += app.settings.points.blue_ribbon;
						other_lane.driver.blue_ribbons++;
						//other_lane.driver.points += app.settings.points.blue_ribbon;
						other_lane.car.blue_ribbons++;
						//other_lane.car.points += app.settings.points.blue_ribbon;
					}
				}
			}
		}
    app.trigger("menu_reset", event);

		if (app.active_race > 0) {
			if (other_lane.driver.crashes > 0) {
				other_lane.driver.crashes--;
				//other_lane.driver.points -= app.settings.points.crash;
			}
			if (other_lane.car.crashes > 0) {
				other_lane.car.crashes--;
				//other_lane.car.points -= app.settings.points.crash;
			}
			app.trigger("history_changed", event);
		}
  },*/

	//add an unrecorded crash to a particular lane
	crash_add:function(event) {
		if (app.active_race == 0) {
			lane = app.race.lanes[event.menu.context.lane-1];
			other_lane = app.other_lane(app.race, lane);
		} else {
			lane = app.session.races[app.session.races.length - app.active_race].lanes[event.menu.context.lane-1]; //TODO: get rid of this crazy negative counting
			other_lane = app.session.races[app.session.races.length - app.active_race].lanes[app.other_lane_id(event.menu.context.lane)-1];
		}

		if (lane.crashes == 0) {
			lane.blue_ribbons = 0;
		}

		lane.crashes++;
    //lane.points += app.settings.points.crash;

		//app.trigger("menu_reset", event);

		app.trigger("recalculate_points")
	},

  //add an unrecorded crash to a particular lane
  crash_subtract:function(event) {
    if (app.active_race == 0) {
      lane = app.race.lanes[event.menu.context.lane-1];
      other_lane = app.other_lane(app.race, lane);
    } else {
      lane = app.session.races[app.session.races.length - app.active_race].lanes[event.menu.context.lane-1]; //TODO: get rid of this crazy negative counting
      other_lane = app.session.races[app.session.races.length - app.active_race].lanes[app.other_lane_id(event.menu.context.lane)-1];
    }

    if (lane.crashes == 0) return;

    lane.crashes--;
    //lane.points -= app.settings.points.crash;

    if (lane.crashes == 0) {
      lane.blue_ribbons = 1;
    }

    //app.trigger("menu_reset", event);
    app.trigger("recalculate_points")
  },

  //add an unrecorded crash to a particular lane
  overtake_add:function(event) {
    if (app.active_race == 0) {
      lane = app.race.lanes[event.menu.context.lane-1];
      other_lane = app.other_lane(app.race, lane);
    } else {
      lane = app.session.races[app.session.races.length - app.active_race].lanes[event.menu.context.lane-1]; //TODO: get rid of this crazy negative counting
      other_lane = app.session.races[app.session.races.length - app.active_race].lanes[app.other_lane_id(event.menu.context.lane)-1];
    }

    lane.over_takes++;

    app.trigger("recalculate_points")
  },

  //add an unrecorded crash to a particular lane
  overtake_subtract:function(event) {
    if (app.active_race == 0) {
      lane = app.car_lane.race.lanes[event.menu.context.lane-1];
      other_lane = app.other_lane(app.race, lane);
    } else {
      lane = app.session.races[app.session.races.length - app.active_race].lanes[event.menu.context.lane-1]; //TODO: get rid of this crazy negative counting
      other_lane = app.session.races[app.session.races.length - app.active_race].lanes[app.other_lane_id(event.menu.context.lane)-1];
    }

    if (lane.over_takes == 0) return;

    lane.over_takes--;
    app.trigger("recalculate_points")
  },

	get_laptimes:function(lap){
    var ary = []
    for (var l=0; l < this.race.lanes.length; l++){
      if (this.race.lanes[l].laptimes[lap]) {
        ary.push({lane_id:l+1,time:this.race.lanes[l].laptimes[lap]})
      }
    }
    ary.sort(function(a,b) {return b.time-a.time}) //sort by laptimes
    return ary
  },

	get_driver_by_id:function(id) {
		//todo: optimise?
		for (var i=0; i < app.settings.drivers.length; i++) {
			if (app.settings.drivers[i].id == id) {
				return app.settings.drivers[i];
			}
		}
		return undefined;
	},

	get_car_by_id:function(id) {
		//todo: optimise?
		for (var i=0; i < app.settings.cars.length; i++) {
			if (app.settings.cars[i].id == id) {
				return app.settings.cars[i];
			}
		}
		return undefined;
	},

	other_lane:function(race, lane) {
		if (lane.id == 2) return race.lanes[0];
		return race.lanes[1];
	},

	// this function deprecated (but don't want to refactor it out yet)
	other_lane_id:function(lane_id) {
		if (lane_id == 1) return 2;
		return 1;
	},

	//calculates an adjust average lap time for the last 5 races
  adjusted_rolling_average:function(lane_num) {
		var total = 0, count = 0, cur_race;
		//loop back through the last 5 races
		if (app.session.races.length == 0) return -1; // no data to calculate average
		if (app.active_race == 0) {
			cur_race = app.session.races.length-1;
		} else {
			cur_race = app.session.races.length-app.active_race;
		}
		for (var r=cur_race; r >= 0; r--) {
			var race = app.session.races[r];
			var lane = race.lanes[lane_num];
			for (var lapnum=0; lapnum < lane.laptimes.length; lapnum++) {
				var laptime = lane.laptimes[lapnum];
				if (laptime > lane.fastest_laptime + 1000) continue; //anything more than a second longer than the fastest lap is considered to a "problem" lap, so ignore it
				total += laptime; count++;
			}
		}
		return (total / count);
  },

  //TODO:refactor !
  fastest_laptime:function() {
    var fastest_lap = 9999;
    if (app.session.fastest_laps.length > 0) {
      for (var l in app.session.fastest_laps) {
        console.log("app.session.fastest_laps[l]",app.session.fastest_laps[l])
        if (app.session.fastest_laps[l]) {
          var lane_id = app.session.fastest_laps[l][0].lane_id
          if (app.session.fastest_laps[l][0] && app.session.fastest_laps[l][0].race.lanes[lane_id-1].fastest_laptime < fastest_lap) {
            fastest_lap = app.session.fastest_laps[l][0].race.lanes[lane_id-1].fastest_laptime;
          }
        }
      }
    }
    return fastest_lap;
  },

  //TODO:refactor !
  fastest_blue_ribbon_avg:function() {
    var fastest_blue_ribbon_avg = 9999;
    if (app.session.fastest_blue_ribbons.length > 0) {
      for (var l in app.session.fastest_blue_ribbons) {
        if (app.session.fastest_blue_ribbons[l]) {
          console.log("app.session.fastest_blue_ribbons[l]",app.session.fastest_blue_ribbons[l]);
          var lane_id = app.session.fastest_blue_ribbons[l][0].lane_id;
          if (app.session.fastest_blue_ribbons[l][0] && app.session.fastest_blue_ribbons[l][0].race.lanes[lane_id-1].average_laptime < fastest_blue_ribbon_avg) {
            fastest_blue_ribbon_avg = app.session.fastest_blue_ribbons[l][0].race.lanes[lane_id-1].average_laptime;
          }
        }
      }
    }
    return fastest_blue_ribbon_avg;
  },



  array_insert:function(array, index, value) {
    index = Math.min(index, array.length);
    array = array.splice(index, 0, value);
  },

  array_insert_sorted:function(array, obj, func) {
    if (!func) {
      //default sort function
      func = function(a,b) {
        return a-b;
      }
    }

    var inserted = false, i;
    for (i=0; i < array.length; i++) {
      var array_item = array[i]
      if (func(array[i], obj) > 0) {
        this.array_insert(array, i, obj);
        inserted = true;
        break;
      }
    }
    if (!inserted) {
			array.push(obj); //if not already inserted, add it to the end of the array
			i = array.length;
		}

    return i;
  }

}

$(window).load(function() {
  app.app()
})
