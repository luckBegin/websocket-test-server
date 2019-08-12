const fs = require('fs') ;
const gm = require('gm') ;
const path = require("path") ;
const sharp = require("sharp") ;
var buildImg = function(img , q , s){
	if(s)
		var size = s.split(",") ;
	return sharp(img)
		.png({
			compressionLevel: q / 1 ,
		})
		.resize(
			size && size[0] ? size[0] / 1 : null ,
			size && size[1] ? size[1] / 1 : null ,
		)
		.toBuffer() ;
};
module.exports = function( req , res , next ){
	let reg = /^\/+images/g ;
	if(reg.test(req.url)){
		let quality = req.query.q ? req.query.q : 9;
		let size = req.query.s ;
		if(!/\d+/g.test(quality) || ( quality < 1  ||  quality > 9)){
			res.status(400) ;
			res.send("q must be integer between 1 - 9") ;
			return ;
		};
		//
		// if(size){
		// 	if(!/^[1-9]\d+$/g.test(size)){
		// 		res.status(400) ;
		// 		res.send("size must be like 100 ,100 or , 100 or 100") ;
		// 		return ;
		// 	};
		//
		// 	if(/\w+,\w+/g.test(size) && !/^[1-9]\d+$,^[1-9]\d+$/g.test(size)){
		// 		console.log(123)
		// 		res.status(400) ;
		// 		res.send("size must be like 100 ,100 or , 100 or 100") ;
		// 		return ;
		// 	};
		//
		// 	if(/,\w+/g.test(size) && !/,^[1-9]\d+$/g.test(size)){
		// 		res.status(400) ;
		// 		res.send("size must be like 100 ,100 or , 100 or 100") ;
		// 		return ;
		// 	}
		// };

		let imgPathReg= /\/images\/.*\.(png|jpg|jpeg|gif)/g ;
		let _path = req.url.match(imgPathReg) ;
		if(_path && _path[0]){
			let imagePath = path.resolve(process.cwd() + '/public' + _path[0]) ;
			buildImg(imagePath , quality , size)
				.then( data => {
					res.header('Content-type', 'image/png');
						res.header("Content-length" , data.length ) ;
						res.end(data, 'binary')
				})
				.catch( err => {
					res.status(404) ;
					res.send("not found") ;
				});
		}else{
			res.send("invalid image url") ;
		}
	}else{
		next() ;
	}
};
