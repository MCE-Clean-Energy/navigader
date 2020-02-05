
const loginRoute = '/login/rest-auth/login/';

export async function login (username: string, password: string): Promise<Response> {
  const headers = new Headers({
    'Content-Type': 'application/json'
  });

  return fetch(loginRoute, {
    body: JSON.stringify({ username, password }),
    headers,
    method: 'post'
  });
}
