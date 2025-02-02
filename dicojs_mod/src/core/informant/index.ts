export { GraphInformant } from './graph_informant.js'
export { Base as TrainingInformant } from './training_informant/base.js'
export * as informant from './training_informant/index.js'

/*
Similar to core/dataset, the /core/informant folder contains methods for training models.
However, in current state of the art, the model starts directly from latent space embeddings,
meaning that the functions here for preprocessing data and training the neural network are not relevant
in our use case.
*/