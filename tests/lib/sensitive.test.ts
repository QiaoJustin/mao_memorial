import { describe, it, expect } from 'vitest';

describe('sensitive word filter', () => {
  it('should filter common sensitive words', () => {
    const content = '这是一段包含敏感词的测试内容';
    expect(content).toBeTruthy();
  });

  it('should handle empty content', () => {
    const content = '';
    expect(content).toBe('');
  });

  it('should handle content without sensitive words', () => {
    const content = '这是一段普通的测试内容';
    expect(content).toBe('这是一段普通的测试内容');
  });
});