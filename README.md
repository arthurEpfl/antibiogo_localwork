# Antibiogo Server

This repo contains two projects:
- the server enabling federated learning for prototypes
- the small web client allowing one to visualize and explore the aggregations performed by the server

## Environment

Both projects are based off [node.js](https://nodejs.org/en/). We highly recommend using [nvm](https://github.com/nvm-sh/nvm) ([asdf](https://asdf-vm.com/) also works) for managing your node environment.
Once nvm is installed, you can run the following to download and activate an environment with node v16 and npm v8:

```
nvm install 16
nvm use 16
```

If you plan on using node for this project exclusively, you can set your default node/npm version to this project's by typing:

```
nvm alias default 16
```

## Server for federated learning

The `server/` dir contains the server code responsible for prototype aggregation.

Once the server received prototype updates from enough clients (threshold currently set to 1), it performs the following aggregation step:

1. Average the positions of received prototypes
3. Increase the sample counts
2. Update the radiuses only if the prototypes belong to new unseen classes
4. Add the prototype labels for new unseen classes

A last step consists in updating the server's prototypes with the aggregation step's results. Before doing so, a human must validate the new prototypes via the model checkpoint interface. 

### Running the server locally

```
cd server/
npm ci
npm start
```

## Web client for model checkpoint

The `model-checkpoint/` dir contains the [Vue](https://vuejs.org/) client from which the server will await for validation after each aggregation step. Once the server received the client's confirmation, it will update its stored prototypes with the aggregation step's results.

### Running the client locally

```
cd model-checkpoint/
npm ci
npm run dev
```
