sounds = {
	audioContext:null,
	audioBuffer:null,
	audio:[],
	
  init:function(){
    //console.log("sound_init",app)
    this.app = app
		
		this.audioContext = new webkitAudioContext()

		var that = this
		this.audioBuffer = new BufferLoader(
			that.audioContext,
			[
				'../../sounds/fastest_lap1.mp3',
				'../../sounds/large_cheer.mp3',
				'../../sounds/small_cheer.mp3',
				'../../sounds/three_laps.mp3',
				'../../sounds/last_lap.mp3',
				'../../sounds/fantastic.mp3',
			],
			function(bufferList){
				that.bufferList = bufferList;			
				that.app.bind("lane_fastest_lap", that.lane_fastest_lap, that)
				that.app.bind("lane_finished", that.lane_finished, that)		
				that.app.bind("three_laps_to_go", that.three_laps_to_go, that)
				that.app.bind("last_lap", that.last_lap, that)
			}
		)
	
		this.audioBuffer.load()
  },

  session_fastest_laptime:function() {
  	console.log("session_fastest_laptime")
  	this.play(5);
  },
  
	lane_fastest_lap:function(){
		//this.audio.vroom.noteOn(0)
		this.play(0);
	},
	
	lane_finished:function(){
		//this.audio.cheer.noteOn(0)
		this.play(1);
	},

	three_laps_to_go:function() {
		this.play(3);
	},

	last_lap:function() {
		console.log("play last lap")
		this.play(4);
	},
	
	play:function(bufferPos) {
		var source = this.audioContext.createBufferSource();
		source.buffer = this.bufferList[bufferPos];
		source.connect(this.audioContext.destination);
		source.start(0);
	}
	
}


function BufferLoader(context,urlList,callback){
	this.context=context;
	this.urlList=urlList;
	this.onload=callback;
	this.bufferList=new Array();
	this.loadCount=0;
}
BufferLoader.prototype.loadBuffer=function(url,index){
	var request=new XMLHttpRequest();
	request.open("GET",url,true);
	request.responseType="arraybuffer";
	var loader=this;
	request.onload=function(){
		loader.context.decodeAudioData(request.response,function(buffer){
			if(!buffer){
				console.log('error decoding file data: '+url);
				return;
			}
			loader.bufferList[index]=buffer;
			if(++loader.loadCount==loader.urlList.length)
				loader.onload(loader.bufferList);
		},function(error){
			console.log('decodeAudioData error',error);
		});
	}
	request.onerror=function(){
		console.log('BufferLoader: XHR error');
	}
	try {
		request.send();
	} catch(e) {
		console.log(e)
	}
}
BufferLoader.prototype.load=function(){
	for(var i=0;i<this.urlList.length;++i)
		this.loadBuffer(this.urlList[i],i);
}
