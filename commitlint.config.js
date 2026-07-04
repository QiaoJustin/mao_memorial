/**
 * commitlint 配置：遵循 Conventional Commits 规范
 * 文档参考：docs/08 §6.3
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'ci'],
    ],
    'subject-max-length': [2, 'always', 72],
  },
};
