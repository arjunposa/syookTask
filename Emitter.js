const io = require("socket.io-client");
const fs = require("fs");
const crypto = require("crypto");

const socket = io.connect("http://127.0.0.1:2001", { reconnect: true });

const algorithm = "aes-256-ctr";
const passphrase = Buffer.from([
  254, 242, 8, 145, 252, 18, 31, 160, 247, 124, 105, 3, 110, 149, 76, 229,
  119, 240, 195, 248, 121, 119, 24, 150, 93, 99, 39, 248, 196, 106, 139, 11,
]);
const iv = Buffer.from([210,138,36,159,1,84,65,62,248,26,220,10,3,233,224,39]);
// console.log(JSON.stringify(iv));

function encryptMsg(message) {
  const cipher = crypto.createCipheriv(algorithm, passphrase, iv);
  const encryptedMsg = Buffer.concat([iv, cipher.update(message, "utf-8"), cipher.final()]);
  return encryptedMsg.toString("hex");
}

function generateRandomData(data) {
  const messages = [];
  const numMsg = Math.floor(Math.random() * (499 - 49 + 1) + 49);

  for (let i = 0; i < numMsg; i++) {
    const msg = {
      name: data.names[Math.floor(Math.random() * data.names.length)],
      origin: data.cities[Math.floor(Math.random() * data.cities.length)],
      destination: data.cities[Math.floor(Math.random() * data.cities.length)],
    };
    msg.secret_key = crypto
      .createHash("sha256")
      .update(JSON.stringify(msg))
      .digest("hex");

    const encryptedMsg = encryptMsg(JSON.stringify(msg));
    messages.push(encryptedMsg);
  }

  return messages.join("|");
}

function sendData() {
  fs.readFile("./public/data.json", "utf-8", function (err, data) {
    if (err) {
      console.error("Error reading json file", err);
      return;
    }
    try {
      const jsonData = JSON.parse(data);
      const encryptedData = generateRandomData(jsonData);
      socket.emit("data", encryptedData);
      // console.log("Sent data:", encryptedData);
    } catch (error) {
      console.error(" error", error);
    }
  });
}

socket.on("connect", function () {
  console.log("Connected to listener service!");
  
  // sendData()
  
  setInterval(() => {
    console.log("sending data....");
    sendData();
  }, 10000);
});

socket.on("disconnect", function () {
  console.log("Disconnected from listener service!");
});


module.exports = {algorithm, passphrase, iv }
console.log(passphrase, "passpharse");
console.log(iv, "iv");