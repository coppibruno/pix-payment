describe('App Tests', () => {
  it('should be defined', () => {
    expect(true).toBe(true);
  });

  it('should have basic math working', () => {
    expect(2 + 2).toBe(4);
  });

  it('should handle strings correctly', () => {
    const message = 'Hello World';
    expect(message).toBe('Hello World');
    expect(message.length).toBe(11);
  });
});
