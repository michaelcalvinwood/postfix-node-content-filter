const SMTP_LISTEN_PORT = 5000;
const STMP_SUBMIT_PORT = 10026;

const SMTPServer = require("smtp-server").SMTPServer;
const getStream = require('get-stream');
const nodemailer = require("nodemailer");

const processMsg = msg => {
    // modify mime msg here  
  
    return msg;
}

const server = new SMTPServer({
    authOptional: true,
    onData(stream, session, callback) {

    let envelope = {};
    envelope.from = session.envelope.mailFrom.address;
    envelope.to = session.envelope.rcptTo.map(to => to.address);

    getStream(stream)
    .then(async msg => {
        let raw = processMsg(msg);
        let message = {
          envelope,
          raw
        };
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