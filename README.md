# tcp2mqtt

## Install

```bash
npm install
```

## Digital simulator

Download Digital from [here](https://github.com/hneemann/Digital).

## Run

First run the demo circuit (testIO.dig) in Digital simulator. This circuit uses the components remoteI and remoteI to access remote signals. Then run the tcp2mqtt app executing the following command:

```bash
node tcp2mqtt
```

It will show something like this:

```
tcp2mqtt v1.0 (c) DECEL 2023
ID: 5e6dfa
Connected to Digital RemoteI @ localhost:13370
Connected to Digital RemoteO @ localhost:13371
Connected to MQTT broker @ nl.h3lio.org:28883
Publish topic decel/5e6dfa/out
Subscribe topic decel/5e6dfa/in
Subscribe topic decel/5e6dfa/id
```

Take note of the ID (5e6dfa in the example) since it will be used later.

## MQTT client

Download MQTTX from [here](https://mqttx.app/).

Credentials:

- host: nl.h3lio.org
- port: 28883
- username: decel
- password: decel2023

## Tests

Turn on B1 and turn off B2 by sending the following MQTT message (notice that inputs I0 and I1 are inverted):

```
topic:   decel/5e6dfa/in
payload: 02
```

Define that the Outputs of the romoteO with be received by the inputs of remoteI by sending the following MQTT message:

```
topic:   decel/5e6dfa/id
payload: 5e6dfa
```
