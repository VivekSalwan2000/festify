/**
 * @jest-environment jsdom
 */
jest.mock('../firebase.js', () => {
  return {
    signUpUser: jest.fn(),
    signInUser: jest.fn(),
    saveUserProfile: jest.fn(),
    onUserStateChanged: jest.fn((callback) => {
      callback({ email: 'test@example.com', uid: '123' });
    }),
  };
});

describe('organizer.js module', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    require('../organizer.js');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log when user is logged in', () => {
    expect(console.log).toHaveBeenCalledWith(
      'User logged in:',
      'test@example.com'
    );
  });
});
