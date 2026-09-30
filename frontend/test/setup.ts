import { afterEach, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { server } from './mocks/server';

// Polyfill HTMLDialogElement methods for jsdom
HTMLDialogElement.prototype.showModal = function() {
  this.open = true;
};
HTMLDialogElement.prototype.close = function() {
  this.open = false;
};

// MSW setup
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());

// Mock environment variables
process.env.VITE_API_URL = 'http://localhost:3000';
