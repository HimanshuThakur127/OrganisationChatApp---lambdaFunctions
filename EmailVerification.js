const nodemailer = require("nodemailer");
exports.handler = (event, context, callback) => {
   var transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    port: 25,
    auth: {
           user: 'thakurhimanshu8449394311@gmail.com',
           pass: 'himanshu@123'
       },
    tls: {
        rejectUnauthorized: false
    }  
   });
 
console.log(event.email)
const mailOptions = {
    from: 'thakurhimanshu8449394311@gmail.com', // sender address
    to: `${event.email}`, // list of receivers
    subject: 'Subject', // Subject line
    html: `<p>Your otp for verification is ${event.otp}</p>`// plain text body
};
var response;
transporter.sendMail(mailOptions, function (err, info) {
    if(err)
      {
          console.log(err)
          response={
              'result':'error'}
      }
    else
      {
          console.log(info);
          response={
              'result':'sended'}
      }
      callback(null,response)
 });
  response={
      'result': 'send'
  }
   callback(null,response)
};
