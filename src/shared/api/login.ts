import { setCookie } from '@nav/shared/util';
import { postRequest } from './util';


/** ============================ Types ===================================== */
type LoginResponse = {
  key: string;
};

/** ============================ API Methods =============================== */
export async function login (username: string, password: string): Promise<Response> {
  return postRequest(`${process.env.REACT_APP_BEO_URI}/rest-auth/login/`, {  username, password })
    .then(res => {
      res.json().then((response: LoginResponse) => {
        if (res.status === 200) {
          // Store the token
          setCookie('authToken', response.key);
          window.location.assign('/load');
        }
      });
      
      return res;
    });
}
