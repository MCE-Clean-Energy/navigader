import { setCookie } from '@nav/shared/util';
import { postRequest } from './util';


/** ============================ Types ===================================== */
type LoginResponse = {
  key: string;
};

/** ============================ API Methods =============================== */
export async function login (username: string, password: string): Promise<Response> {
  return postRequest('/beo/rest-auth/login/', {  username, password })
    .then(res => {
      res.json().then((response: LoginResponse) => {
        if (res.status === 200) {
          // Store the token
          setCookie('authToken', response.key);
        }
      });
      
      return res;
    });
}
