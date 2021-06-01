var mysql = require('mysql');
var config = require('./config.json');

var pool  = mysql.createPool({
    host     : config.dbhost,
    user     : config.dbuser,
    password : config.dbpassword,
    database : config.dbname,
  });
 
exports.handler= (event, context, callback) => {
  var response;    
  context.callbackWaitsForEmptyEventLoop = false;
  pool.getConnection(function(err,connection){
    if(err){
        console.log(err)
    }
    else
    {
       switch(event.case){
             case '1': connection.query(`select e.emp_id,e.email,e.name,e.type,e.org_id, e.created_at, o.name as orgname,e.isactive,e.picurl,e.channels from empolyee e inner join Organisation o on e.org_id=o.org_id where emp_id=${event.empId}`,function(error,results,fields){
                       connection.release();
                       if(error) response={"result":error};
                       else {
                           response={
                               "result": JSON.stringify(results)
                           };
                       }
                       callback(null,response);
                       })
                       break;
             case '2': connection.query(`select * from empolyee where org_id=${event.orgId}`,function(error,result,fields){
                           if(error) response={
                               "result": error
                           }
                           else{
                               response={
                                   "result":JSON.stringify(result)
                               }
                           }
                            callback(null,response);   
                        })
                       break;
            case '3': connection.query(`select email from empolyee`,function(error,results,fields){
                        if(error){
                            response={
                                "result": error
                            }
                        }
                        else{
                            response={
                                "result":JSON.stringify(results)
                            }
                        }
                        connection.release();
                        callback(null,response);
                      }) 
                      break;
            case "4": connection.query(`select compCode from Organisation where org_id=${event.orgId}`,function(error,results,fields){
                       if(error){
                           response={
                               "result":error
                           }
                       }
                       else{
                           response={
                               "result":results[0].compCode
                           }
                       }
                       connection.release();
                       callback(null,response);
                     })
                    break;
            case "5":connection.query(`select emp_id,email,org_id,isactive from empolyee`,function(error,results,fields){
                        if(error){
                            response={
                                "result":error
                            }
                        }
                        else{
                               connection.release()
                               callback(null,{"result":JSON.stringify(results)});
                           }
                    })  
                    break;
            case "6":connection.query(`select isactive from empolyee where org_id=${event.orgId} and type='admin'`,function(error,results,fields){
                    if(error)
                     {
                         response={
                             "result":error
                         }
                     }
                     else{
                         connection.release()
                         if(results.length>0)
                         callback(null,{"result":JSON.stringify(results)});
                         else
                          callback(null,JSON.stringify({"result":{"isactive":'false'}}));
                     }
                  })
                  break;
            case "7":connection.query(`SELECT emp_id from empolyee where  email="${event.email}" and password="${event.password}";`,function(error,results,fields){
                      connection.release();
                      if(error) console.log(error);
                      else{
                          if(results.length>0){
                              callback(null,{"result":JSON.stringify(results)})
                          }
                          else{
                              callback(null,JSON.stringify({"result":"incorrect password"}));
                          }
                      }
                 })
                 break;
                 
            default: callback(null,response);           
       } 
    }
   
  });
  
}
