const WebSocket = require('ws');

var currentConnect = [] ;

const hasConnected = {} ;

let hasAward = []

const WsServe = new WebSocket.Server({
	port: 3333,
});
var timer = null ;

var state = 'wait' ;

const strategy =  {
	"save" : function( data ){
		if(data && data.id){
			if( hasConnected[data.id]){
				console.log("current user has connected") ;
			}else{
				// hasConnected[data.id] = true ;
				// data.count = 0 ;
				// currentConnect.push(data) ;

				console.log("current length is :" + currentConnect.length ) ;
			};
		};
	} ,
	"getAll" : function( data , ws ){
		const list = {
			all : currentConnect ,
			hasAward : hasAward
		} ;
		ws.send(JSON.stringify({"action" : "getAll" , "data" : list }));
	} ,
	"award" : function( data , ws) {
		console.log(data) ;
		if(data instanceof Array){
			data.forEach( item => {
				if(item.name)
					hasAward[item.name] = true ;
			})
		};

		if(data && data.name){
			hasAward[data.name] = true ;
		}
	},
	"getAward" : function( data , ws ){
		ws.send(JSON.stringify({"action" : "getAward" , "data" : hasAward }));
	} ,
	"shake" : function(data ,ws ){

		if(state === 'wait')
			return ;

		var id = data.id ;

		console.log("reveive shake event with id is " + id ) ;
		currentConnect.forEach( item => {
			if(item.UserWXopenId === id && item.Status === '0'){
                item.count += 1 ;
            }
		});
	} ,
	getRank : function( data , ws){
		currentConnect.sort(ObjSort("count")) ;

		ws.send(JSON.stringify({'action' : 'getRank' , "data" : currentConnect })) ;
	} ,
	start : function( data , ws ){

		var time = data.time  ;

		var award = data.award ;

		var list = data.list ;

        currentConnect = list ;

		currentConnect.forEach( item => {
			item.count = 0 ;
		});


		state = 'start' ;

		if(timer)
			return ;

		timer = setInterval( () => {

			time -- ;

			let data = currentConnect.sort(ObjSort("count")).slice( 0 , award )
			if( time === -1 ){
				clearInterval(timer) ;

				timer = null ;

				hasAward = hasAward.concat( data ) ;

				state = 'wait' ;

				WsServe.clients.forEach( ( client ) => {
					client.send(JSON.stringify({action : 'end' , data : data  , rest : currentConnect }))
				});

				hasAward = currentConnect.splice(0 , 10 ) ;
			}else{
				WsServe.clients.forEach( ( client ) => {
					client.send(JSON.stringify({action : 'start' ,data : data , time : time , rest : currentConnect }))
				});

			};
		} , 1000 ) ;
	},
    ping : function(){
        WsServe.clients.forEach( ( client ) => {
            client.send(JSON.stringify({action : 'ping'}))
        });
    }
} ;

WsServe.on("connection" , con => {
	console.log("A client has been contected") ;
	con.on("message" , message => {
		const data = JSON.parse( message ) ;
		if( data.event === 'heartBeat') {
			WsServe.clients.forEach( ( client ) => {
				client.send(JSON.stringify({event : 'heartBeat' , data: ''})) ;
			});
		}
	});

	con.on("close" , client => {
		console.log(client) ;
	});
});

module.exports = WsServe ;
