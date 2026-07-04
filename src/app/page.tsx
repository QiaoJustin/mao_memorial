'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TimelineCard from '@/components/TimelineCard';
import PhotoCard from '@/components/PhotoCard';
import MessageCard from '@/components/MessageCard';
import ErasNav from '@/components/ErasNav';
import SearchBar from '@/components/SearchBar';
import { ArrowRight, BookOpen, Image, MessageCircle, Sparkles } from 'lucide-react';

interface Era {
  id: number;
  name: string;
  startYear: number;
  endYear: number;
}

interface FeaturedNode {
  id: number;
  title: string;
  description: string;
  date: string;
  location?: string;
  viewCount: number;
  eraName: string;
  photoUrl?: string;
}

interface Photo {
  id: number;
  url: string;
  thumbnailUrl: string;
  caption: string;
  timelineNodeId?: number;
}

interface Message {
  id: number;
  content: string;
  nickname: string;
  createdAt: string;
  likeCount: number;
}

interface HotSearch {
  keyword: string;
  count: number;
}

async function fetchEras(): Promise<Era[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/eras`, { cache: 'force-cache' });
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

async function fetchFeaturedNodes(): Promise<FeaturedNode[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/timeline/featured?limit=6`, { cache: 'force-cache' });
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

async function fetchFeaturedPhotos(): Promise<Photo[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/photos?page=1&pageSize=8`, { cache: 'force-cache' });
    const data = await res.json();
    return data.data?.list || [];
  } catch {
    return [];
  }
}

async function fetchLatestMessages(): Promise<Message[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/messages?page=1&pageSize=3`, { cache: 'force-cache' });
    const data = await res.json();
    return data.data?.list || [];
  } catch {
    return [];
  }
}

async function fetchHotSearch(): Promise<HotSearch[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/search/hot`, { cache: 'force-cache' });
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export default function HomePage() {
  const [eras, setEras] = useState<Era[]>([]);
  const [featuredNodes, setFeaturedNodes] = useState<FeaturedNode[]>([]);
  const [featuredPhotos, setFeaturedPhotos] = useState<Photo[]>([]);
  const [latestMessages, setLatestMessages] = useState<Message[]>([]);
  const [hotSearch, setHotSearch] = useState<HotSearch[]>([]);

  useEffect(() => {
    async function loadData() {
      const [erasData, nodesData, photosData, messagesData, searchData] = await Promise.all([
        fetchEras(),
        fetchFeaturedNodes(),
        fetchFeaturedPhotos(),
        fetchLatestMessages(),
        fetchHotSearch(),
      ]);
      setEras(erasData);
      setFeaturedNodes(nodesData);
      setFeaturedPhotos(photosData);
      setLatestMessages(messagesData);
      setHotSearch(searchData);
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <section className="relative min-h-screen bg-gradient-crimson overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        
        <div className="container-page relative pt-24 pb-16 md:pt-32 md:pb-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm text-white/80">缅怀伟人 · 传承精神</span>
            </div>
            
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              毛泽东同志生平纪念
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              以100张珍贵历史照片为核心载体，按时间顺序展示毛泽东主席从1918年到1965年的重要时间节点和重大事件，重温伟人波澜壮阔的一生。
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                href="/timeline"
                className="btn-primary text-base px-8 py-4"
              >
                浏览时间轴
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="/photos"
                className="btn-outline text-base px-8 py-4 bg-transparent border-white/30 text-white hover:bg-white/10"
              >
                查看照片
              </Link>
            </div>

            <div className="max-w-xl mx-auto">
              <SearchBar placeholder="搜索时间节点、事件..." />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-bg to-transparent" />
      </section>

      <section className="py-16 bg-bg">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-text mb-4">年代导航</h2>
            <p className="text-text-light">按历史时期浏览，了解毛主席在不同阶段的重要经历</p>
          </div>
          <ErasNav eras={eras} />
        </div>
      </section>

      <section className="py-16 bg-surface/50">
        <div className="container-page">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-text mb-2">精选事件</h2>
              <p className="text-text-light">重温毛泽东主席生平中的重要历史时刻</p>
            </div>
            <Link
              href="/timeline"
              className="flex items-center gap-1 text-primary hover:text-primary-dark transition-colors"
            >
              查看全部
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredNodes.map((node) => (
              <TimelineCard key={node.id} {...node} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-bg">
        <div className="container-page">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-text mb-2">珍贵照片</h2>
              <p className="text-text-light">记录伟人风采的历史影像</p>
            </div>
            <Link
              href="/photos"
              className="flex items-center gap-1 text-primary hover:text-primary-dark transition-colors"
            >
              查看全部
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredPhotos.map((photo) => (
              <PhotoCard key={photo.id} {...photo} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-surface/50">
        <div className="container-page">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-text mb-2">留言纪念</h2>
              <p className="text-text-light">缅怀伟人，表达敬意</p>
            </div>
            <Link
              href="/messages"
              className="flex items-center gap-1 text-primary hover:text-primary-dark transition-colors"
            >
              发表留言
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestMessages.map((message) => (
              <MessageCard key={message.id} {...message} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-bg">
        <div className="container-page">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-text mb-2">热门搜索</h2>
              <p className="text-text-light">大家都在搜索什么</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {hotSearch.map((item, index) => (
              <Link
                key={index}
                href={`/search?q=${encodeURIComponent(item.keyword)}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-surface rounded-full text-sm text-text-light hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <span className="text-accent font-medium">#{index + 1}</span>
                {item.keyword}
                <span className="text-xs text-text-light/60">{item.count}次</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-crimson">
        <div className="container-page">
          <div className="text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">传承红色基因</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              毛泽东同志是伟大的马克思主义者，伟大的无产阶级革命家、战略家、理论家，是中国共产党和中国人民解放军的缔造者，是中华人民共和国的缔造者。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="flex items-center gap-3 text-white">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold">98</p>
                  <p className="text-sm text-white/80">重要时间节点</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-white">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <Image className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold">100+</p>
                  <p className="text-sm text-white/80">珍贵历史照片</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-white">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold">1000+</p>
                  <p className="text-sm text-white/80">缅怀留言</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}