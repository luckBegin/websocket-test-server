var express = require('express');
var router = express.Router();
var fs = require("fs") ;
var path = require("path") ;
var multer = require("multer");
var listServive = require('./service/list.service') ;
const prefix = require("./config").prefix ;
/* GET home page. */
var storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, path.join(__dirname , "../public/images"));
	},
	filename: function(req, file, cb) {
		let arr = file.originalname.split(".") ;
		let name = Date.now() ;
		req.query.imageName = `${name}.${arr[arr.length - 1 ]}` ;
		cb(null, `${ name }.${arr[arr.length - 1 ]}`)
	}
});


var upload = multer({ storage: storage });

router.post('/image' , upload.single('img'), function(req, res, next) {
	res.send({success : true , message : "" , data : { path : req.query.imageName }}) ;
});
router.post('/upload' , upload.single('img'), function(req, res, next) {
	listServive.post( { path: req.query.imageName , projectId : 1 })
		.then( result => {
			res.send({success : true , message : "" , data : { path : prefix +req.query.imageName }}) ;
		}) 
		.catch( e => {
			console.log(e) ;
		})
});
router.get("/image" , function(req,res,next){
	var jsonPath = path.join(__dirname , "../imageList.json") ;
	var size = req.query.size ? req.query.size : 5 ;
	var page = req.query.page ? req.query.page : 1 ;
	fs.readFile(jsonPath, 'utf-8' , function(err , text){
		if(err){
			res.send({
				success :false ,
				data : err ,
				message :"读取信息失败"
			});
		}else{
			var txt = JSON.parse(text) ;
			res.send({
				success : true ,
				data : txt.slice(  size * (page -1)  , size * page ) ,
				message : ""
			}) ;
		};
	});
});

router.delete("/image" , function(req,res,next){
	var index = req.query.id ;
	var jsonPath = path.join(__dirname , "../imageList.json") ;
	fs.readFile(jsonPath, 'utf-8' , function(err , text){
		if(err){
			res.send({
				success :false ,
				data : err ,
				message :"读取信息失败"
			});
		}else{
			var txt = JSON.parse(text) ;

			txt.splice(index , 1 ) ;
			fs.writeFile( jsonPath , JSON.stringify(txt) , function(err){
				if(err){
					res.send({
						success :false ,
						data : err ,
						message :"写入信息失败"
					});
				}else{
					res.send({
						success : true ,
						data : {
							all : txt
						},
						message : ""
					}) ;
				};
			})

		};
	});
});
module.exports = router;
