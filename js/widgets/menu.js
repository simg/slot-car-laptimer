menu = {
  init:function(){
    //app.bind("keypress", this.keypress, this);
    //app.bind("new_race", this.reset, this);
    //app.bind("app_init", this.render, this);
    //app.bind("menu_reset", this.reset, this);
  },
  
  init:function(event) {
    this.render(event);
  },
 
  render:function(){
    if ($("#menu").length == 0) {
      $("#page").append('<div id="menu"><ul /></div>');
    } else {
      $("#menu").html('<ul />');
    }

    var h = '';    
    var items = this.context.items ? this.context.items : this.items; // either use top level menu items or if context set use that
    for (i in items) {
      if (items[i].title) { //only show menu item if it has a title (it still functions identically to a normal menu item, but it's invisible)
        h += '<li><a href="#" onclick="app.trigger(\'keypress\',{key:\'' + items[i].key + '\'})">' + items[i].title + '</a></li>';
      }
    }
    
    $("#menu ul").append(h);
  },
  
  context:{},
  
  items:[
    {
      title:"<u>N</u>ew race",key:"N",action:function(event) {
        app.trigger("new_race",{save:true});  
      }
    },
    {
      /*title:"<u>T</u>oggle show time</ul>",*/ key:"T", action:function(event) {
        app.trigger("toggle_show_times",{})
      },
    },
    {
      /*title:"<u>V</u>iew",*/ key:"V", event:"toggle_scale_mode"
    },      
    {
      /*title:"Zoom +/-",*/ key:"+", action:function(event) {
        app.trigger("scale_zoom_in", {});
      },
    },
    {
      title:"", key:"-", action:function(event) {
        app.trigger("scale_zoom_out", {});
      }
    },
    {
      title:"<u>D</u>river", key:"D",
      items:[
        {title:"Lane <u>1</u>", key:"1", context:"lane", event:"select_driver"},
        {title:"Lane <u>2</u>", key:"2", context:"lane", event:"select_driver"},
        {title:"Throttle <u>s</u>wap", key:"S", event:"throttle_swap"}
      ]
    },
    {
      title:"<u>C</u>ar", key:"C",
      items:[
        {title:"Lane <u>1</u>", key:"1", context:"lane", event:"select_car"},
        {title:"Lane <u>2</u>", key:"2", context:"lane", event:"select_car"},
        {title:"Car <u>s</u>wap", key:"S", event:"car_swap"},
      ]
    },    
    {
      title:"<u>B</u>lame", key:"B",
      items:[
        {
          title:"Lane <u>1</u>", key:"1", context:"lane",
          items:[
            {title:"+", key:"+", event:"crash_add"},
            {title:"-", key:"-", event:"crash_subtract"},
          ]
        },
        {
          title:"Lane <u>2</u>", key:"2", context:"lane",
          items:[
            {title:"+", key:"+", event:"crash_add"}, 
            {title:"-", key:"-", event:"crash_subtract"}, 
          ]
        },
        /*{title:"Lane <u>2</u>", key:"2", context:"lane", event:"crash_blame"},
        {title:"<u>A</u>dd", key:"A",
          items:[
            {title:"Lane <u>1</u>", key:"1", context:"lane", event:"crash_add"},
            {title:"Lane <u>2</u>", key:"2", context:"lane", event:"crash_add"}
          ]
        },*/
      ]
    },
    {
      title:"<u>O</u>vertakes", key:"O",
      items:[
        {
          title:"Lane <u>1</u>", key:"1", context:"lane",
          items:[
            {title:"+", key:"+", event:"overtake_add"},
            {title:"-", key:"-", event:"overtake_subtract"},
          ]
        },
        {
          title:"Lane <u>2</u>", key:"2", context:"lane",
          items:[
            {title:"+", key:"+", event:"overtake_add"}, 
            {title:"-", key:"-", event:"overtake_subtract"}, 
          ]
        },
      ]
    },    
    /*{
      title:"<u>S</u>ettings", key:"S",
      items:[
        
      ]
    },*/
    {
      title:"<u>S</u>ummary", key:"S", event:"toggle_summary"
    }
  ],
  
  new_race:function(event) {
    this.menu_reset(event);
  },
  
  keypress:function(event) {
    var handled = false;
    
    if (!this.context.items) {
      // don't count laps in submenu
      switch (event.keyCode) {
        case 65: //a
        case 49: //1
          event.lane = 1;
          app.race.lanes[0].count_lap(event);
          handled = true;
          break;
        case 81: //q
        case 50: //2
          event.lane = 2;
          app.race.lanes[1].count_lap(event);
          handled = true;
          break;
      }
    }
    
    
    switch (event.keyCode) {
      case 27:
      case 69: //e (fix for broken laptop escape button) 
        this.menu_reset()
        handled = true;
        break;
      case 33: //pgup
      case 38: //cursor up
        if (app.active_race > 0) {
          app.active_race--;
          if (app.active_race == 0) {
            app.race = app.saved_race;
          } else {
            app.race = app.session.races[app.session.races.length-app.active_race];
          }
          app.trigger("change_race", event);
          stopEventPropagation(event);         
          handled = true;
        }
        break;
      case 34: //pgdown
      case 40: //cursor down
        if (app.active_race == 0) app.saved_race = app.race;
        if (app.active_race < app.session.races.length) {
          app.active_race++;       
          app.race = app.session.races[app.session.races.length-app.active_race];
          app.trigger("change_race", event)
        }
        stopEventPropagation(event);                 
        handled = true;
        break;
      case 187: //+
        if (!this.context) {
          //only do this at the top level of the menu
          app.trigger("scale_zoom_in", event);
          handled = true;
          break;
        }
      case 189: //-
        if (!this.context) {
          //only do this at the top level of the menu
          app.trigger("scale_zoom_out", event );
          handled = true;
          break;
        }
        if (event.keyCode == 187) {
          event.key = "+";
        } else if (event.keyCode == 189) {
          event.key = "-";
        }
      default:
        if (!event.key) {
          // if we don't already have a key determined (ie one wasn't set programmatically on the event)
          event.key = String.fromCharCode(event.keyCode); // get the keycode and uppercase to make matching case insensitive
        }
        var items = this.context.items ? this.context.items : this.items; // either use top level menu items or if context set use that
        event.menu = this;
        for (var i in items) {
          if (event.key == items[i].key) {
    
            // if this menu item has an event then trigger it (passing the original event)
            if (items[i].event) {
              app.trigger(items[i].event, event);
            }
            
            //store the key press in the menu's context for anything that needs it.
            if (items[i].context) {
              this.context[items[i].context] = event.key;
            }
            
            //if this menu item has an action, then run that function immediately
            if (items[i].action) {
              items[i].action(event);  
            }
            
            //if the menu item has a child menu, activate that menu and render it
            if (items[i].items) {
              this.context.items = items[i].items; // change to the submenu
              this.render();
            }
            handled = true;
            stopEventPropagation(event); 
          }
        }
        break;
      }
    if (!handled) {
      console.log("unrecognized key sequence", event, event.keyCode, event.key)
    }
    
  },
  
  menu_reset:function() {
    this.context = {};
    $("#modal").hide();
    this.render();
  }
}

function stopEventPropagation(event) {
  if (event.stopPropagation)    event.stopPropagation();
  if (event.cancelBubble!=null) event.cancelBubble = true;
  if (event.preventDefault) event.preventDefault();
}