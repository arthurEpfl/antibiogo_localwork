import { List } from 'immutable'
import * as tf from '@tensorflow/tfjs'

import { Embedding } from '../types.js'

/*
Get latent space embeddings as tensor.
*/ 

export function loadEmbeddings (embeddings: string): List<Embedding> {
  return List(JSON.parse(embeddings) as number[][]).map((s) => tf.tensor(s))
}
