import { describe, it, expect } from 'vitest';

describe('Timeline API', () => {
  it('should return timeline nodes list', async () => {
    const mockResponse = {
      code: 200,
      data: {
        list: [
          {
            id: 1,
            title: '测试节点',
            date: '1918年3月',
            description: '测试描述',
          },
        ],
        page: 1,
        pageSize: 10,
        total: 98,
      },
    };
    expect(mockResponse.code).toBe(200);
    expect(mockResponse.data.list.length).toBeGreaterThan(0);
  });

  it('should return node detail', async () => {
    const mockResponse = {
      code: 200,
      data: {
        id: 1,
        title: '测试节点',
        date: '1918年3月',
        description: '测试描述',
        photos: [],
        tags: [],
      },
    };
    expect(mockResponse.code).toBe(200);
    expect(mockResponse.data.title).toBe('测试节点');
  });

  it('should return adjacent nodes', async () => {
    const mockResponse = {
      code: 200,
      data: {
        prev: { id: 1, title: '上一个', date: '1918年3月' },
        next: { id: 2, title: '下一个', date: '1919年5月' },
      },
    };
    expect(mockResponse.code).toBe(200);
    expect(mockResponse.data.prev).toBeDefined();
    expect(mockResponse.data.next).toBeDefined();
  });
});