change_settings = {
  init:function(){
    
  },
  
  select_driver:function(event){
    //console.log("notify_render")
    if ($("#modal").length == 0) {
      $("#page").append('<div id="modal"><div class="overlay" /><div class="content" />');
    }
    
    var h = '';
    
    h = '<h1>Select driver - Lane ' + event.key + '</h1>';
    h += '<ol>';
    //event.menu.context.driver = event.key;
    event.menu.context.items = [];
    for (var i=0; i < app.settings.drivers.length; i++) {  
      h += '<li><a href="#" onclick="app.trigger(\'keypress\',{key:\'' + app.settings.drivers[i].id + '\'})">' + app.settings.drivers[i].name+'</a></li>';
      event.menu.context.items.push({key:(""+(app.settings.drivers[i].id)), event:"change_driver"}); //TODO: needs to work with more than 9 drivers
    }
    h += '</ol>';
    $("#modal .content").html(h);
    $("#modal").show();
  },
  
  change_driver:function(event) {
    
    var new_driver_id = event.key;
    var session_lane = app.session.lanes[app.menu.context.lane-1];
    var session_other_lane = app.session.lanes[app.other_lane_id(app.menu.context.lane)-1];
    
    var race_lane, race_other_lane;
        
    if (app.active_race == 0) {
      //app.new_race(event); //if not in history mode ensure the data doesn't get mixed up by swapping drivers at the end of a race
      race_lane = app.race.lanes[(app.menu.context.lane-1)];
      race_other_lane = app.race.lanes[app.other_lane_id(app.menu.context.lane)-1];
      
    } else {
      var race_lane = app.session.races[app.session.races.length - app.active_race].lanes[(app.menu.context.lane-1)];
      var race_other_lane = app.session.races[app.session.races.length - app.active_race].lanes[app.other_lane_id(app.menu.context.lane)-1];
    }
    
    var old_driver = race_lane.driver;
    var new_driver = app.get_driver_by_id(new_driver_id);
    var other_driver = race_other_lane.driver
    
    if (other_driver.id == new_driver.id) {
      //if this driver is already in the other lane, then assume swap drivers  //TODO: this code is clunky
      race_other_lane.driver = race_lane.driver;
      if (app.active_race == 0) {
        session_other_lane.driver = session_lane.driver;  //also adjust the session driver details if we're not in history mode
      }
      race_other_lane.driver = race_lane.driver;
    }
    
    race_lane.driver = new_driver;
    if (app.active_race == 0) {
      session_lane.driver = new_driver //also adjust the session driver details if we're not in history mode
    }
    
    if (app.active_race > 0) {
      //editing history mode, so need to move some points around
      
      //remove race points for outgoing driver
      old_driver.crashes -= race_lane.crashes;
      old_driver.points  -= race_lane.points;
      old_driver.blue_ribbons  -= race_lane.blue_ribbons;
      
      //add race points to incoming driver
      new_driver.crashes += race_lane.crashes;
      new_driver.points  += race_lane.points;
      new_driver.blue_ribbons  += race_lane.blue_ribbons;
      
      if (other_driver.id == new_driver.id) {
        //swapping throttles
        //add points for other race to "outgoing" driver
        old_driver.crashes += race_other_lane.crashes;
        old_driver.points  += race_other_lane.points;
        old_driver.blue_ribbons  += race_other_lane.blue_ribbons;      
        //add points for other race to "incoming" driver
        new_driver.crashes -= race_other_lane.crashes;
        new_driver.points  -= race_other_lane.points;
        new_driver.blue_ribbons  -= race_other_lane.blue_ribbons;
      } else {
        old_driver.delete_race_by_id(app.session.races[app.session.races.length - app.active_race].id)
        new_driver.races.push(app.session.races[app.session.races.length - app.active_race]); //TODO: need a more robust / efficient way of indexing / counting drivers relationships
      }
      app.trigger("history_changed", event); 
    }

    app.trigger("menu_reset", event);
    app.trigger("driver_changed", event);
    
    $("#modal").hide();
  },
  
  throttle_swap:function(event) {
    
    event.menu.context.lane = 1; //hack to make it work
    var other_driver;
    if (app.active_race == 0) {
      other_driver = app.session.lanes[1].driver;  
    } else {
      other_driver = app.session.races[app.session.races.length - app.active_race].lanes[1].driver;
    }
    
    event.key = other_driver.id; //cause the change driver function to handle the swap
    this.change_driver(event);
    /*
     *app.new_race(event); //ensure the data doesn't get mixed up by swapping cars at the end of a race
    var temp_driver = app.race.lanes[0].driver;
    app.session.lanes[0].driver = app.session.lanes[1].driver;
    app.race.lanes[0].driver = app.race.lanes[1].driver;
    app.session.lanes[1].driver = temp_driver;
    app.race.lanes[1].driver = temp_driver;
    app.trigger("menu_reset", event);
    app.trigger("driver_changed", event);*/
  },
  
  select_car:function(event) {
    if ($("#modal").length == 0) {
      $("#page").append('<div id="modal"><div class="overlay" /><div class="content" />');
    }
    
    var h = '';
    
    h = '<h1>Select car - Lane ' + event.key + '</h1>';
    h += '<ol>';
    //event.menu.context.car = event.key;
    event.menu.context.items = [];
    for (var i=0; i < app.settings.cars.length; i++) {  
      h += '<li><a href="#" onclick="app.trigger(\'keypress\',{key:\'' + app.settings.cars[i].id + '\'})">' + app.settings.cars[i].name+'</a></li>';
      event.menu.context.items.push({key:(""+(app.settings.cars[i].id)), event:"change_car"}); 
    }
    
    //hack option to add new cars TODO: do this better (with sophont)
    h += '<li><input id="car_name" onkeydown="if(event.stopPropagation){event.stopPropagation();}event.cancelBubble=true;" placeholder="Car '+(app.settings.cars.length+1)+'" type="textbox" name="car_name" /><input type="button" value="add" onclick="app.change_settings.add_car(this)" /></li>';
    //event.menu.context.items.push({key:(""+(app.settings.cars[i].id)), action:function(){$("#car_name").focus()}});     
    h += '</ol>';
    $("#modal .content").html(h);
    
    $("#modal").show();
  },
  
  add_car:function(button) {
    var new_car = Object.create(Car, {});
    var new_name = $("#car_name").val();
    if (new_name.trim().length == 0) {
      new_name = $("#car_name").attr('placeholder');
    }
    new_car.init({
      id:app.settings.cars.length,
      name:new_name
    });
    app.settings.cars.push(new_car);
    app.trigger("change_car", {
      key:new_car.id,
      menu:app.menu
    });
  },
  
  change_car:function(event) {
    app.new_race(event); //ensure the data doesn't get mixed up by swapping cars at the end of a race
    var new_car_id = event.key;
    if (app.session.lanes[app.other_lane_id(event.menu.context.lane)-1].car.id == new_car_id) {
      //if this car is already in the other lane, then assume swap cars
      app.session.lanes[app.other_lane_id(event.menu.context.lane)-1].car = app.session.lanes[(event.menu.context.lane-1)].car;
      app.race.lanes[app.other_lane_id(event.menu.context.lane)-1].car = app.race.lanes[(event.menu.context.lane-1)].car
    }    
    app.session.lanes[(event.menu.context.lane-1)].car = app.get_car_by_id(event.key);
    app.race.lanes[(event.menu.context.lane-1)].car = app.get_car_by_id(event.key);
    app.trigger("menu_reset", event);
    app.trigger("car_changed", event);
    $("#modal").hide();
  },
  
  car_swap:function(event) {
    app.new_race(event); //ensure the data doesn't get mixed up by swapping cars at the end of a race
    var temp_car = app.race.lanes[0].car;
    app.session.lanes[0].car = app.session.lanes[1].car;
    app.race.lanes[0].car = app.race.lanes[1].car;
    app.session.lanes[1].car = temp_car;
    app.race.lanes[1].car = temp_car;
    app.trigger("menu_reset", event);
    app.trigger("car_changed", event);
  }
  
}