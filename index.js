'use strict';

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// Imports dependencies and set up http server
const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server
const request = require("request");

function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}

function handleMessage(sender_psid, received_message) {

  let response;

  // Check if the message contains text
  if (received_message.text.includes("ayuda")) {
    // Create the payload for a basic text message
    response = {
      "text": `¡Hola Bienvenido! Si necesitas ayuda por favor escribe /help`
    }
  } else {
    switch (received_message.text) {
      case "/help":
        response = { text: `/help - consulta los comandos de ayuda
        /llamar - consulta el número de telefono
        /correo - consulta el correo de contacto
        /portafolio - consulta los trabajos realizados
        /web - consulta el link de la página web` };
        break;
      case "/llamar":
        response = { text: "+56962817146" };
        break;
      case "/correo":
        response = { text: "rafaelrojas.cov@gmail.com" };
        break;
      case "/portafolio":
        response = { text: "En construcción" };
        break;
      case "/web":
        response = { text: "https://www.rafaelrojascov.com" };
        break;
      case "/hi5":
        response = { text: "Hi Five! Q(^-^Q)" };
        break;
      case "/hobbies":
        response = { text: "Desarrollar, aprender y jugar Injustice 2!" };
        break;
      case "/status":
        response = { text: "Disponible para nuevos proyectos :-)" };
        break;
    }
  }
//${received_message.text}
  // Sends the response message
  callSendAPI(sender_psid, response);
}


// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {  
 
  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {

      // Gets the body of the webhook event
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);


      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }

    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = PAGE_ACCESS_TOKEN
    
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
  
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});


// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

