// Time to wait for the others in milliseconds.
export const MAX_WAIT_PER_ROUND = 10_000

/*
Set timeout and function that rthrows error when limit exceeded.
*/

export async function timeout (ms: number): Promise<never> {
  return await new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error('timeout')), ms)
  })
}
