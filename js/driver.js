Driver = {
  id:null,
  name:null,
  color:null,
  races:0,
  points:{
    total:0,
    history:[]
  },
  wins:0,
  crashes:0,
  blue_ribbons:0,
  
  init:function(data) {
    this.id = data.id;
    this.name = data.name;
    this.color = data.color;
    this.races = 0;
    this.points = 0;
    this.wins = 0;
    this.crashes = 0;
    this.blue_ribbons = 0;
  }, 
}