import { cookieManager } from 'navigader/util/cookies';
import { beoRoute, postRequest } from './util';


/** ============================ Types ===================================== */
type LoginResponse = {
  key: string;
};

type ErrorArray = string[];
type ChangePasswordResponse = Partial<{
  old_password: ErrorArray;
  new_password1: ErrorArray;
  new_password2: ErrorArray;
}>

/** ============================ API Methods =============================== */
export async function login (email: string, password: string): Promise<Response> {
  const response = await postRequest(routes.login, { email, password });
  const json: LoginResponse = await response.json();

  if (response.status === 200) {
    // Store the token
    cookieManager.authToken = json.key;
  }

  return response;
}

export async function logout () {
  return await postRequest(routes.logout);
}

export async function changePassword (
  oldPassword: string,
  newPassword1: string,
  newPassword2: string
): Promise<ChangePasswordResponse> {
  const response = await postRequest(routes.password.change, {
    old_password: oldPassword,
    new_password1: newPassword1,
    new_password2: newPassword2
  });

  return await response.json();
}

/** ============================ Helpers =================================== */
const pwRoute = (rest: string) => beoRoute.restAuth(`password/${rest}`);
const routes = {
  login: beoRoute.restAuth('login/'),
  logout: beoRoute.restAuth('logout/'),
  password: {
    change: pwRoute('change/'),
    reset: pwRoute('reset/')
  }
};
