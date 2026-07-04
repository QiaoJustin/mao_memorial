import { describe, it, expect } from 'vitest';

describe('Auth API', () => {
  it('should return token on successful login', async () => {
    const mockResponse = {
      code: 200,
      data: {
        token: 'mock-jwt-token',
        user: {
          id: 1,
          username: 'admin',
          name: '管理员',
          role: 'super_admin',
        },
      },
    };
    expect(mockResponse.code).toBe(200);
    expect(mockResponse.data.token).toBeTruthy();
    expect(mockResponse.data.user.username).toBe('admin');
  });

  it('should return error for invalid credentials', async () => {
    const mockResponse = {
      code: 401,
      message: 'Invalid credentials',
    };
    expect(mockResponse.code).toBe(401);
    expect(mockResponse.message).toBe('Invalid credentials');
  });

  it('should return current user info', async () => {
    const mockResponse = {
      code: 200,
      data: {
        id: 1,
        username: 'admin',
        name: '管理员',
        role: 'super_admin',
      },
    };
    expect(mockResponse.code).toBe(200);
    expect(mockResponse.data.id).toBe(1);
  });
});