import { expect, afterEach, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { server } from './mocks/server';

// Extend Vitest matchers with jest-dom
expect.extend(matchers);

// Polyfill HTMLDialogElement methods for jsdom
HTMLDialogElement.prototype.showModal = function() {
  this.open = true;
};
HTMLDialogElement.prototype.close = function() {
  this.open = false;
};

// MSW setup
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());

// Mock environment variables
process.env.VITE_API_URL = 'http://localhost:3000';
