import { prisma } from './db';

interface TrieNode {
  children: Map<string, TrieNode>;
  isEnd: boolean;
  level: number;
  replacement: string;
}

let trieRoot: TrieNode | null = null;
let lastUpdateTime = 0;
const CACHE_TTL = 5 * 60 * 1000;
// 敏感词阻断阈值：级别 >= BLOCK_LEVEL_THRESHOLD 的内容将被拒绝发布
const BLOCK_LEVEL_THRESHOLD = 2;

function createTrieNode(): TrieNode {
  return {
    children: new Map(),
    isEnd: false,
    level: 0,
    replacement: '',
  };
}

async function buildTrie(): Promise<void> {
  const words = await prisma.sensitiveWord.findMany({
    where: { isActive: true },
  });

  trieRoot = createTrieNode();
  
  for (const word of words) {
    let node = trieRoot;
    for (const char of word.word) {
      if (!node.children.has(char)) {
        node.children.set(char, createTrieNode());
      }
      node = node.children.get(char)!;
    }
    node.isEnd = true;
    node.level = word.level;
    node.replacement = word.replacement;
  }
  
  lastUpdateTime = Date.now();
}

async function ensureTrie(): Promise<void> {
  if (!trieRoot || Date.now() - lastUpdateTime > CACHE_TTL) {
    await buildTrie();
  }
}

export interface FilterResult {
  filtered: string;
  hasSensitive: boolean;
  blocked: boolean;
  sensitiveWords: Array<{ word: string; level: number }>;
}

export async function filterSensitiveWords(content: string): Promise<FilterResult> {
  await ensureTrie();
  
  if (!trieRoot) {
    return {
      filtered: content,
      hasSensitive: false,
      blocked: false,
      sensitiveWords: [],
    };
  }

  const result: FilterResult = {
    filtered: content,
    hasSensitive: false,
    blocked: false,
    sensitiveWords: [],
  };

  let filteredContent = content;
  const sensitiveWords: Array<{ word: string; level: number }> = [];

  for (let i = 0; i < content.length; i++) {
    let node = trieRoot;
    let matchedWord = '';
    let maxLevel = 0;
    let maxReplacement = '';
    
    for (let j = i; j < content.length; j++) {
      const char = content[j];
      if (!node.children.has(char)) {
        break;
      }
      node = node.children.get(char)!;
      matchedWord += char;
      
      if (node.isEnd) {
        maxLevel = Math.max(maxLevel, node.level);
        maxReplacement = node.replacement;
      }
    }

    if (matchedWord && maxLevel > 0) {
      sensitiveWords.push({ word: matchedWord, level: maxLevel });
      
      if (maxLevel >= BLOCK_LEVEL_THRESHOLD) {
        result.blocked = true;
        break;
      }

      const replacement = maxReplacement.repeat(matchedWord.length) || '*'.repeat(matchedWord.length);
      filteredContent = filteredContent.replace(matchedWord, replacement);
    }
  }

  result.filtered = filteredContent;
  result.hasSensitive = sensitiveWords.length > 0;
  result.sensitiveWords = sensitiveWords;

  return result;
}

export async function containsHighLevelSensitive(content: string): Promise<boolean> {
  const result = await filterSensitiveWords(content);
  return result.blocked;
}

export async function replaceSensitiveWords(content: string): Promise<string> {
  const result = await filterSensitiveWords(content);
  return result.filtered;
}

export async function refreshTrie(): Promise<void> {
  await buildTrie();
}
