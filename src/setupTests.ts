import { cookieManager } from 'navigader/util';

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
require('jest-fetch-mock').enableMocks();

beforeEach(() => {
  process.env = Object.assign(process.env, {
    REACT_APP_BEO_URI: 'http://test-domain.com',
  });

  // Fake authorization
  cookieManager.authToken = 'fakeAuth';
});
