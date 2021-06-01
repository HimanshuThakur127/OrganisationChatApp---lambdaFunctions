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
  var response={
    "result":""    
  };
 pool.getConnection(function(err,connection){
    if(err) {response=err; console.log(err) }
    else{
         switch(event.case){
            case "1": //inserting message
                    var sql='';
                    if(event.contentType=='text')
                    {
                       sql=`insert into messages(sender_id,receiver_id,msg_type,content,content_type) values(${event.senderId},${event.receiverId},'${event.msgType}','${event.content}','${event.contentType}');`
                       console.log(sql)
                    }
                    else if(event.contentType=='doc'){
                      sql=`insert into messages(sender_id,receiver_id,msg_type,content,docurl,content_type) values(${event.senderId},${event.receiverId},'${event.msgType}','${event.content}','${event.doc}','${event.contentType}')`;
                      console.log(sql)
                    }
                    else{
                      if(event.contentType=='code')
                      sql=`insert into messages(sender_id,receiver_id,msg_type,content,docurl,content_type) values(${event.senderId},${event.receiverId},"${event.msgType}","${event.content}","""${event.doc}""","${event.contentType}")`;
                      console.log(sql);
                    }
                    connection.query(sql,function(error,results,fields){
                     if(error) {
                         response.result=error;
                         console.log(error)
                     }
                     else{
                         getrecentMessage();
                     }
                    })
                   
                    break;
            case "2": // selecting messages
                     sql='';
                    if(event.msgId==0){
                     sql=`select e.name as sender_name,n.msg_id,n.msg_type,n.content,n.docurl,n.pinned,n.content_type,n.created_at,n.sender_id from empolyee as e inner join (select * from (select * from messages where receiver_id=${event.receiverId} and msg_type='${event.msgType}' order by msg_id desc) as messages order by msg_id asc) as n on e.emp_id=n.sender_id`;
                    }
                    else{
                      sql=`select * from (select * from messages where receiver_id=${event.receiverId} and msg_type='${event.msgType}' and msg_id<${event.msgId} order by msg_id desc) as message order by msg_id asc`;
                    } 
                    connection.query(sql,function(error,results,fields){
                      connection.release(); 
                     if(error){  console.log(error); response=error;}
                     else{
                       response={
                          "result": JSON.stringify(results)};
                     }
                    
                     callback(null,response);
                    })
                    break;
            case "3": //pinned massage
                    connection.query(`update messages set pinned=${event.pinned} where msg_id=${event.msgId}`,function(error, results, fields) {
                        connection.release(); 
                        if(error){  console.log(error); response=error;}
                        else{
                         
                        }
                        callback(null,response);
                    })
            case "4":connection.query(`update messages set docurl="""${event.doc}""" where msg_id=${event.msgId}`,function(error,results,fields){
                        connection.release();
                        if(error) console.log(error)
                        else{
                            response={
                                "result":JSON.stringify(event)
                            }
                        }
                        callback(null,response);
                  })        
            default:  callback(null,"not the case");        
         }
    } //end of else
  
  function getrecentMessage(){
      var sql=`select * from messages where sender_id=${event.senderId} and receiver_id=${event.receiverId} and msg_type='${event.msgType}' order by created_at desc limit 1`;
      var res='fg';
      connection.query(sql,function(error, results, fields) {
          if(error){
              return res="error in code";
          }
          else
          {
            res=results[0];
            res["senderName"]=event.senderName;
            res=JSON.stringify(res);
          }
        callback(null,{"result":res});  
      });
  } 
     
  }); //end of getConnection
  
}
