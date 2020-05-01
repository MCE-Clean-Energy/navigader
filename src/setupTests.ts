import { setCookie } from '@nav/common/util';

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
require('jest-fetch-mock').enableMocks();

beforeEach(() => {
  process.env = Object.assign(process.env, {
    REACT_APP_BEO_HOST: 'test-domain.com'
  });
  
  // Fake authorization
  setCookie('authToken', 'fakeAuth');
});
