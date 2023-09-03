const http = require("http");
const socketIo = require("socket.io");
const crypto = require("crypto");
const mongoose = require("mongoose");
const User = require("./users");
const { algorithm, passphrase, iv } = require("./Emitter");
const { readFileSync } = require("fs");
const { join } = require("path");

const Port = 2001;
const hostname = "127.0.0.1";
const server = http.createServer(function (req, res) {
  const { method, url } = req;
  if (method === "GET") {
    if (url === "/") {
      const home = readFileSync(join(__dirname, "public", "index.html"), "utf-8");
      try {
        res.writeHead(200);
        res.write(home);
      } catch (err) {
        console.log(err);
      }
    }
  }
  res.end();
});

const io = socketIo(server);

const SavedData = [];

function decryptMsg(encryptedMessage) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(passphrase),
    Buffer.from(encryptedMessage.slice(0, 32), "hex")
  );
  const decryptedMsg = Buffer.concat([
    decipher.update(encryptedMessage.slice(32), "hex"),
    decipher.final(),
  ]);
  return decryptedMsg.toString();
}

mongoose.connect('mongodb://127.0.0.1:27017/EncryptTimeSeriesDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');

  io.on("connection", (socket) => {
    console.log("Client connected!");

    socket.on("data", (encryptedData) => {
      const encryptedMessages = encryptedData.split("|");
      let msg;
      for (const message of encryptedMessages) {
        const decryptedMsg = decryptMsg(message);
        msg = JSON.parse(decryptedMsg);
      
       
       const receivedKey = msg.secret_key
      //  console.log(receivedKey);
        
        const validateKey = crypto
          .createHash("sha256")
          .update(JSON.stringify(msg))
          .digest("hex");
          
       
         if(validateKey === receivedKey){
          async function DataSave() {
            try {
              const result = await User.create({
                name: msg.name,
                location: msg.location,
                destination: msg.destination,
              });
              SavedData.push(result);
            } catch (err) {
              console.log("error at", err);
            }
          }
  
          DataSave();
         } else {
          // The keys do not match, so the message is invalid
          console.log("Received message is invalid. Discarding.");
        }

       
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected!");
    });
  });

  // Create an endpoint to fetch the received data
  server.on("/data", function (req, res) {
    if(req.method === "GET"){
      if(req.url === "/data") {
        res.setHeader("Content-Type", "application/json");
        res.writeHead(200);
        res.write("<h1>Data Generated on Server</h1>")
    
        // Send the received data as a JSON response
        res.end(JSON.stringify(SavedData));
      }
    }
   
  });

  server.listen(Port, hostname, function () {
    console.log("http://" + hostname + ":" + Port);
  });
});

mongoose.connection.on('error', err => {
  console.error('Connection failed with error:', err);
});
