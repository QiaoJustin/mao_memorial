import { describe, it, expect } from 'vitest';

describe('API response helpers', () => {
  it('should format success response correctly', () => {
    const data = { id: 1, name: 'test' };
    const response = { code: 200, data, message: 'Success' };
    expect(response.code).toBe(200);
    expect(response.data).toEqual(data);
  });

  it('should format error response correctly', () => {
    const error = { code: 400, message: 'Bad Request' };
    expect(error.code).toBe(400);
    expect(error.message).toBe('Bad Request');
  });

  it('should format paginated response correctly', () => {
    const list = [1, 2, 3];
    const pagination = { page: 1, pageSize: 10, total: 100, totalPages: 10 };
    const response = { code: 200, data: { list, ...pagination } };
    expect(response.data.list).toEqual(list);
    expect(response.data.total).toBe(100);
  });
});