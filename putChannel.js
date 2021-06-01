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
  var response={"result":""};
  pool.getConnection(function(err,connection){
      if(err) console.log(err);
      else {
           switch(event.case){
             case "1":  //insert channel in db
                        connection.query(`insert into channel(org_id,lead_id,name,discription) values(${event.orgId},${event.createrId},'${event.name}','${event.discription}')`,function(error,results,fields){
                         if(error) {response={"result":error};}
                          else{
                            connection.query(`select ch_id from channel where org_id=${event.orgId} and lead_id=${event.createrId} and name='${event.name}'`,function(error,results,fields){
                              if(error) {response={"result":error};}
                              else{
                                   var members=JSON.parse(event.members);
                                   for(var i=0;i<members.length;i++)
                                        updatechannel(members[i],results[0].ch_id,event.orgId);
                                   response={"result":JSON.stringify({"empId":event.createrId,"orgId":event.orgId,"channelId":results[0].ch_id})};   
                              }
                              connection.release();
                              callback(null,response);
                            })
                          }
                      });
                      break;
              case "2": //select the channels
                        connection.query(`select c.ch_id, c.org_id,c.created_at,c.lead_id,c.name,c.discription,c.churl from channel  c  inner join (select grp_id from channelMember where mem_id=${event.empId} and ${event.orgId}) as g on c.ch_id=g.grp_id`,function(error,results,fields){
                           if(error) {response={"result":error};}
                            else  {
                                response={ "result": JSON.stringify(results) }; 
                           }
                           connection.release();
                           callback(null,response);
                       })
                      break;
             case "3": //insert the direct
                         connection.query(`insert into direct(orgs_id,creater_id,mem_id,member_name,creater_name) values(${event.orgId},${event.createrId},${event.memId},'${event.member}','${event.creater}')`,function(error,results,fields){
                                 if(error) response={
                                     "result":error
                                 };
                                 else  response={
                                     "result":"value updated"
                                     };
                                 connection.release();
                                 callback(null,response);
                             })
                       break;
            case '4': //selecting all direct
                       connection.query(`select * from direct where creater_id=${event.empId} or mem_id=${event.empId}`,function(error,results,fields){
                        connection.release()
                        if(error) response=error;
                        else response={"result":JSON.stringify(results) };
                        callback(null,response);
                       })
                       break;
            case "5": //selecting all members of channels
                      connection.query(`select e.emp_id,e.org_id,e.type,e.name,e.email,e.picurl,e.isactive from empolyee as e inner join (select mem_id from channelMember where grp_id=${event.chId}) as s on e.emp_id=s.mem_id`,function(error,results,fields){
                        connection.release()
                        if(error) { response={"result":error};}
                        else {
                            response={"result":JSON.stringify(results)};
                        }
                        callback(null,response);
                      })
                      break;
            case "6": connection.query(`select * from channel where org_id=${event.orgId})`, function(error,results,fields){
                        if(error) console.log(error);
                        else
                          {
                              response={
                                  "result":JSON.stringify(results)
                              }
                          }
                        callback(null,response);  
                    })          
         } //end of switch
      }
    
   function updatechannel(memId,chanl,orgId){
            connection.query(`insert into channelMember(grp_id,mem_id,org_id) values(${chanl},${memId},${orgId})`,function(error,results,fields){
                   if(error) {
                    console.log(error);
                  }
                  
            });
    }

})
}
