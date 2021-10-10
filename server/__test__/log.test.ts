import { log } from '../src/logger/log';

test('log well', () => {
  const logMock = jest.fn();
  console.log = logMock;
  log('Hell');
  expect(logMock.mock.calls[0][0]).toBe('Hell');
});
