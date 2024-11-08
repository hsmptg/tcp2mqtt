/*
 * Copyright (c) 2024 Helio Mendonca.
 * Use of this source code is governed by the GPL v3 license
 * that can be found in the LICENSE file.
 */

version = 'v1.0'
var hw = require('./mac.js')
const id = hw.getID()
console.log('tcp2mqtt', version, '(c) DECEL 2023')
console.log('ID:', id)

// https://www.emqx.com/en/blog/how-to-use-mqtt-in-nodejs
// npm install mqtt --save
const mqtt = require('mqtt')
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`

const deceltopic = 'decel/' + id
var topicid = ''

const fs = require('fs')
const path = require('path')
var caFile = fs.readFileSync(path.join(__dirname, './cert/broker.crt'))
var certFile = fs.readFileSync(path.join(__dirname, './cert/client.crt'))
var keyFile = fs.readFileSync(path.join(__dirname, './cert/client.key'))

var opts = {
  rejectUnauthorized: false,
  username: 'decel',
  password: 'decel2023',
  connectTimeout: 5000,
  ca: [ caFile ],
  cert: certFile,
  key: keyFile
}

const host = 'nl.h3lio.org'
const port = '28883'
const connectUrl = `mqtts://${host}:${port}`
const mqttclient = new mqtt.connect(connectUrl, opts)

// https://javascript.plainenglish.io/how-to-set-up-your-tcp-client-server-application-with-nodejs-from-scratch-5d218a1300f2
const net = require('net');
const tcpportout = 13370;
const tcpportin = 13371;

const tcpclientout = new net.Socket();
const tcpclientin = new net.Socket();

tcpclientout.connect(tcpportout,function(){
  console.log(`Connected to Digital RemoteI @ localhost:${tcpportout}`);
});

tcpclientin.connect(tcpportin,function(){
  console.log(`Connected to Digital RemoteO @ localhost:${tcpportin}`);
});

mqttclient.on('connect', () => {
  console.log(`Connected to MQTT broker @ ${host}:${port}`)
  console.log(`Publish topic ${deceltopic}/out`)
  var topic = 
  mqttclient.subscribe([deceltopic+'/in'], () => {
    console.log(`Subscribe topic ${deceltopic}/in`)
  })
  mqttclient.subscribe([deceltopic+'/id'], () => {
    console.log(`Subscribe topic ${deceltopic}/id`)
  })
})

tcpclientin.on('data', function(data) {
  payload = data.toString('hex').toUpperCase();
  console.log('sent:', deceltopic+'/out', payload);
  mqttclient.publish(deceltopic+'/out', payload, { qos: 0, retain: false }, (error) => {
    if (error) {
      console.error(error)
    }
  })    
});

mqttclient.on('message', (topic, payload) => {
  console.log('received:', topic, payload.toString());
  b = Buffer.from(payload.toString(), "hex");
  if ((topic == (deceltopic+"/in")) || (topic == topicid)) {
    tcpclientout.write(b);
  }  
  else if (topic == (deceltopic+"/id")) {
    if (topicid != '')
      mqttclient.unsubscribe(topicid)
    else {
      topicid = 'decel/' + payload.toString() + '/out';
      mqttclient.subscribe([topicid], () => {
        console.log('Subscribe new topic', topicid)
      })
    }
  }
});

tcpclientin.on('close',function(){
  console.log('Digital in: Connection Closed');
});

tcpclientin.on('error',function(error){
  console.error(`Digital in: ${error}`);
});

tcpclientout.on('close',function(){
  console.log('Digital out: Connection Closed');
});

tcpclientout.on('error',function(error){
  console.error(`Digital out: Connection Error ${error}`); 
});
