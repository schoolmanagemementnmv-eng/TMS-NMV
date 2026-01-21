
import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { geminiService } from '../services/geminiService';
import { NewsItem } from '../types';

const NewsManagement: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>(storageService.getNews());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftTopic, setDraftTopic] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftTitle, setDraftTitle] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);

  const handleAiDraft = async () => {
    if (!draftTopic) return;
    setIsDrafting(true);
    try {
      const result = await geminiService.generateNotice(draftTopic);
      setDraftContent(result || "");
      setDraftTitle(draftTopic);
    } finally {
      setIsDrafting(false);
    }
  };

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    storageService.addNews({
      title: draftTitle || formData.get('title') as string,
      content: draftContent || formData.get('content') as string,
      category: formData.get('category') as any,
    });
    setNews(storageService.getNews());
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setDraftTitle('');
    setDraftContent('');
    setDraftTopic('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notices & News</h1>
          <p className="text-gray-500">Post announcements for all teachers</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 shadow-sm"
        >
          Post New Notice
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {news.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                item.category === 'Circular' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {item.category}
              </span>
              <span className="text-xs text-gray-400">{item.date}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-gray-600 text-sm whitespace-pre-wrap">{item.content}</p>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">New Announcement</h2>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }}>×</button>
            </div>
            <div className="p-6">
              <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <label className="block text-sm font-bold text-emerald-700 mb-2">✨ AI Assistant (Draft from Topic)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="e.g., Staff meeting on Friday at 2pm"
                    className="flex-1 px-3 py-2 border border-emerald-200 rounded-lg text-sm outline-none"
                    value={draftTopic}
                    onChange={(e) => setDraftTopic(e.target.value)}
                  />
                  <button 
                    onClick={handleAiDraft}
                    disabled={isDrafting || !draftTopic}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isDrafting ? 'Drafting...' : 'Generate'}
                  </button>
                </div>
              </div>

              <form onSubmit={handlePost} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input 
                    name="title" 
                    required 
                    value={draftTitle} 
                    onChange={e => setDraftTitle(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select name="category" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option value="Notice">Notice</option>
                    <option value="Circular">Circular</option>
                    <option value="Event">Event</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea 
                    name="content" 
                    required 
                    rows={5}
                    value={draftContent}
                    onChange={e => setDraftContent(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  ></textarea>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-4 py-2 text-gray-500 font-medium">Cancel</button>
                  <button type="submit" className="bg-emerald-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-emerald-700">Post Notice</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsManagement;
