import * as routes from '@nav/shared/routes';
import { setCookie } from '@nav/shared/util';
import { beoRoute, postRequest } from './util';


/** ============================ Types ===================================== */
type LoginResponse = {
  key: string;
};

/** ============================ API Methods =============================== */
export async function login (email: string, password: string): Promise<Response> {
  return postRequest(beoRoute.restAuth('login/'), { email, password })
    .then(res => {
      res.json().then((response: LoginResponse) => {
        if (res.status === 200) {
          // Store the token
          setCookie('authToken', response.key);
          window.location.assign(routes.dashboard.base);
        }
      });
      
      return res;
    });
}
