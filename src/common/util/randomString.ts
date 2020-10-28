/**
 * Returns a random string ~20 characters long. Taken from https://gist.github.com/6174/6062387
 */
export function randomString() {
  const firstHalf = Math.random().toString(36).substring(2, 15);
  const secondHalf = Math.random().toString(36).substring(2, 15);
  return firstHalf + secondHalf;
}
