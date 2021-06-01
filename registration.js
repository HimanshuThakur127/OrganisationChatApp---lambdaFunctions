var mysql = require('mysql');
var config = require('./config.json');

var pool  = mysql.createPool({
    host     : config.dbhost,
    user     : config.dbuser,
    password : config.dbpassword,
    database : config.dbname,
  });

exports.handler= (event, context, callback) => {  
     context.callbackWaitsForEmptyEventLoop = false; 
      var res; 
      pool.getConnection(function(err, connection) {
      // Use the connection
      if(err) {
          res='error in connection';
      }
      else{
      var sql='';
       switch (event.case) {
           case '1': //registration for Organisation
                    connection.query(`insert into Organisation(name,compCode,password,email) values('${event.name}','${event.compCode}','${event.password}','${event.email}')`,function(error, results, fields) {
                        if(error) 
                        {
                            res={"result":error};
                            console.log(error);
                            connection.release()
                            callback(null,res);       
                        }
                        else {
                            addAdmin();
                        }
                    });
                    
                    break;
           case '2': //registration for empolyee
                   
                     connection.query(`select org_id from Organisation where compCode='${event.compCode}'`,function(error, results, fields) {
                       if(error) callback(null,{"result":error}) 
                        if(results.length==0){
                            res={"result":"invalid companyCode"};
                            callback(null,res)
                        }     
                        else{
                           console.log(`event ${results[0].org_id}`);
                          connection.query(`insert into empolyee(org_id,name,email,password,isactive) values(${results[0].org_id},'${event.name}','${event.email}','${event.password}','${event.isactive}')`, function (error, result, fields) {
                          // Handle error after the release.
                          if (error) {
                               console.log(error)  
                              res={"result":error};
                              connection.release()
                              callback(null,res);
                          }
                          else {
                               console.log(`insert into empolyee(org_id,name,email,password,isactive) values(${results[0].org_id},'${event.name}','${event.email}','${event.password}','${event.isactive}'`)
                                getEmpId(results[0].org_id);
                          }
                            
                          });
                       }
                    }) 
                    break;
           default: res='not a case';
                    callback(null,res)
                    break;
               // code
       } //end of switch
      } //end of else
 function addAdmin(){
      connection.query(`select org_id from Organisation where compCode='${event.compCode}'`,function(error,results,fields){
         if(error){
             res={
                 "result": error
             }
             callback(null,res)
         }
         else{
             connection.query(`insert into empolyee(org_id,name,email,password,type,isactive) values(${results[0].org_id},'${event.name}','${event.email}','${event.password}','admin','true') `, function(error,result,fields){
                 if(error){
                     res={
                         "result": error
                     }
                     callback(null,res)
                 }
                 else{
                     getEmpId(results[0].org_id);
                 }
             })
         }
         
      })
      
  }
  
function getEmpId(orgId){
    console.log(orgId)
    connection.query(`select emp_id from empolyee where org_id=${orgId} and email='${event.email}' and password='${event.password}'`,function(error,results,fields){
        if(error) {
            res={
                "result":error
            }
        }
        else{
            console.log(`select emp_id from empolyee where org_id=${orgId} and email='${event.email}' and password='${event.password}'`)
           res={
               "result":JSON.stringify({"empId":results[0].emp_id})
           } 
        }
        connection.release()
        callback(null,res);
    })
}  
}); //end of getConnection

} //end of handler

