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
}>;

type SendPasswordResetEmailResponse = {
  email?: ErrorArray;
};

type ConfirmPasswordResetResponse = Partial<{
  new_password1: ErrorArray;
  new_password2: ErrorArray;
  token: ErrorArray;
  uid: ErrorArray;
}>;

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

export async function sendResetPasswordEmail (email: string) {
  const response = await postRequest(routes.password.reset, { email });
  const json: SendPasswordResetEmailResponse = await response.json();
  return {
    response,
    error: (json.email || [])[0]
  }
}

export async function confirmPasswordReset (
  password1: string,
  password2: string,
  token: string,
  uid: string
) {
  const requestBody = { new_password1: password1, new_password2: password2, token, uid };
  const response = await postRequest(routes.password.confirmReset, requestBody);
  const json: ConfirmPasswordResetResponse = await response.json();
  return {
    response,
    error: (json.new_password1 || json.new_password2 || json.token || json.uid || [])[0]
  }
}

/** ============================ Helpers =================================== */
const passwordRoute = (rest: string) => beoRoute.restAuth(`password/${rest}`);
const routes = {
  login: beoRoute.restAuth('login/'),
  logout: beoRoute.restAuth('logout/'),
  password: {
    change: passwordRoute('change/'),
    confirmReset: passwordRoute('reset/confirm/'),
    reset: passwordRoute('reset/')
  }
};
