const SMTP_LISTEN_PORT = 5000;
const STMP_SUBMIT_PORT = 10026;

/*
  https://www.npmjs.com/package/mimetext
  https://www.npmjs.com/package/mimemessage

*/
const SMTPServer = require("smtp-server").SMTPServer;
//const getStream = require('get-stream');
const nodemailer = require("nodemailer");
const simpleParser = require('mailparser').simpleParser;

const processMsg = msg => {
    // modify mime msg here  
    console.log(msg);

    return msg;
}

const extractValue = (key, source) => {
  const loc = source.indexOf(':', key.length);
  return source.substring(loc+1).trimStart();
}

const processHtml = html => {

  // process the email html here

  
  
  return html;

}

const convertToNodeMailerMessageFormat = msg => {
  let message = {};
 
  // set headers
  message.headers = {};
  let i;

  for (i = 0; i < msg.headerLines.length; ++i) {
      switch(msg.headerLines[i].key) {
        case 'from':
            message.from = extractValue('from', msg.headerLines[i].line);
            break;
        case 'to':
            message.to = extractValue('to', msg.headerLines[i].line);
            break;
        case 'subject':
            message.subject = extractValue('subject', msg.headerLines[i].line);
            break;
        case 'content-type':
            break;
        default:
            if (typeof message.headers[msg.headerLines[i].key.toString()] === 'undefined') {
                message.headers[msg.headerLines[i].key] = [];
            } 
            message.headers[msg.headerLines[i].key.toString()].push(extractValue(msg.headerLines[i].key, msg.headerLines[i].line));
      }
  }

  // add attachments

  // process html
  message.html = processHtml(msg.html);

  // process text
  message.text = processHtml(msg.textAsHtml);
  
  console.log('message', message);
  
  return message;
}

const server = new SMTPServer({
    authOptional: true,
    onData(stream, session, callback) {

    let envelope = {};
    envelope.from = session.envelope.mailFrom.address;
    envelope.to = session.envelope.rcptTo.map(to => to.address);

    simpleParser(stream)
    //getStream(stream)
    .then(async msg => {
        let msgObject = processMsg(msg);
        let message = convertToNodeMailerMessageFormat(msgObject);
        
        // let message = {
        //   envelope,
        //   
        // };
        let transporter = nodemailer.createTransport({
          host: "127.0.0.1",
          port: 10026,
          secure: false,
          ignoreTLS: true
        });
        try {
          let info = await transporter.sendMail(message);
          callback(null);
        } catch (e) {
          console.error(e);
          callback(new Error("Content filter unable to submit processed msg to SMTP server."));
        }
        
    })
    .catch (e => {
      console.error(e);
      callback(new Error("Content filter unable to receive message from SMTP server."));
    });
    }
  });

  server.listen(SMTP_LISTEN_PORT);