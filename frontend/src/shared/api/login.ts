import { postRequest } from './util';


export function login (username: string, password: string): Promise<Response> {
  return postRequest('/login/rest-auth/login/', {  username, password });
}
