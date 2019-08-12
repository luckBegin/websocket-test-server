var mysql      = require('mysql');
let mysqlConfig = {
    host     : 'rm-8vb1r9ph2yxkn8n1g.mysql.zhangbei.rds.aliyuncs.com',
    user     : 'zhibei',
    password : 'rhm$tc$V',
    database : 'image_manage',
    multipleStatements: true
}
let mysqlFnc = function(con){
    var connection = mysql.createConnection(mysqlConfig);
    connection.connect();
    con(connection)
};
module.exports = mysqlFnc;
