export const log = (arg: string) => console.log(arg);

if (process.env['NODE_ENV'] === 'test') {
  test('log correctly', () => {
    const logMock = jest.fn();
    console.log = logMock;
    log('Hell');
    expect(logMock.mock.calls[0][0]).toBe('Hell');
  });
}
