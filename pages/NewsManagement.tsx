
import React, { useState, useRef } from 'react';
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
  const [tempImages, setTempImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAiDraft = async () => {
    if (!draftTopic) return;
    setIsDrafting(true);
    setError(null);
    try {
      const result = await geminiService.generateNotice(draftTopic);
      if (result) {
        setDraftContent(result);
        setDraftTitle(draftTopic);
      } else {
        setError("AI Assistant failed to generate a draft. Please check your connection or try again.");
      }
    } catch (e) {
      setError("An unexpected error occurred while drafting.");
    } finally {
      setIsDrafting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const filesArray = Array.from(files) as File[];
      const remainingSlots = 3 - tempImages.length;
      
      if (remainingSlots <= 0) {
        alert("Maximum 3 images allowed per announcement.");
        return;
      }

      const selectCount = Math.min(filesArray.length, remainingSlots);

      for (let i = 0; i < selectCount; i++) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setTempImages(prev => [...prev, reader.result as string].slice(0, 3));
        };
        reader.readAsDataURL(filesArray[i]);
      }
    }
  };

  const removeImage = (index: number) => {
    setTempImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const title = draftTitle || formData.get('title') as string;
    const content = draftContent || formData.get('content') as string;
    const category = formData.get('category') as any;

    if (!title || !content) {
      alert("Title and Content are required.");
      return;
    }

    storageService.addNews({
      title,
      content,
      category,
      imageUrls: tempImages
    });

    setNews(storageService.getNews());
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setDraftTitle('');
    setDraftContent('');
    setDraftTopic('');
    setTempImages([]);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notices & News</h1>
          <p className="text-gray-500">Manage school-wide announcements and documents</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Post New Announcement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map(item => (
          <div key={item.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
            {item.imageUrls && item.imageUrls.length > 0 ? (
              <div className={`grid gap-0.5 w-full h-48 ${item.imageUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {item.imageUrls.map((url, idx) => (
                  <img 
                    key={idx} 
                    src={url} 
                    alt={`${item.title} ${idx}`} 
                    className={`w-full h-full object-cover ${item.imageUrls?.length === 3 && idx === 0 ? 'row-span-2' : ''}`} 
                  />
                ))}
              </div>
            ) : (
              <div className="w-full h-32 bg-emerald-50 flex items-center justify-center">
                 <svg className="w-12 h-12 text-emerald-100" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" /></svg>
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                  item.category === 'Circular' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {item.category}
                </span>
                <span className="text-xs text-gray-400 font-medium">{item.date}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{item.title}</h3>
              <p className="text-gray-600 text-sm whitespace-pre-wrap line-clamp-3 leading-relaxed mb-4">{item.content}</p>
              <button className="text-emerald-600 font-bold text-xs hover:underline flex items-center gap-1">
                View Details
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950 bg-opacity-80 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] w-full max-w-4xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b flex justify-between items-center bg-emerald-800 text-white">
              <div>
                <h2 className="text-2xl font-black">Publish New Notice</h2>
                <p className="text-emerald-200 text-sm mt-1">Broadcast information to all faculty portals</p>
              </div>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-emerald-200 hover:text-white transition-colors bg-white/10 p-2 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="flex flex-col lg:flex-row h-[70vh]">
              {/* AI Sidebar */}
              <div className="w-full lg:w-72 bg-emerald-50 p-6 border-r border-emerald-100 overflow-y-auto">
                <div className="mb-4">
                  <span className="text-[10px] font-black uppercase text-emerald-700 tracking-widest bg-emerald-100 px-2 py-1 rounded">Smart Assistant</span>
                </div>
                <h4 className="text-sm font-bold text-gray-800 mb-4">Draft using AI</h4>
                <p className="text-xs text-gray-500 mb-6">Describe the topic below and we'll draft a formal notice for you.</p>
                
                <div className="space-y-4">
                  <textarea 
                    placeholder="e.g. Mandatory staff meeting on next Monday at 1 PM to discuss exam schedules..."
                    className="w-full px-4 py-3 border border-emerald-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 min-h-[120px] resize-none"
                    value={draftTopic}
                    onChange={(e) => setDraftTopic(e.target.value)}
                  />
                  <button 
                    onClick={handleAiDraft}
                    disabled={isDrafting || !draftTopic}
                    className="w-full bg-emerald-600 text-white px-4 py-3 rounded-xl text-sm font-black hover:bg-emerald-700 disabled:opacity-50 shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                  >
                    {isDrafting ? 'Drafting...' : '✨ Generate Draft'}
                  </button>
                  {error && <p className="text-[10px] text-red-500 font-bold mt-2">{error}</p>}
                </div>
              </div>

              {/* Main Editor */}
              <form onSubmit={handlePost} className="flex-1 p-8 overflow-y-auto flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Notice Title</label>
                    <input 
                      name="title" 
                      required 
                      value={draftTitle} 
                      onChange={e => setDraftTitle(e.target.value)}
                      placeholder="Enter a descriptive title..."
                      className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-emerald-500 outline-none font-bold text-gray-800" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
                    <select name="category" required className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-emerald-500 outline-none font-bold text-gray-800 appearance-none">
                      <option value="Notice">Notice</option>
                      <option value="Circular">Circular</option>
                      <option value="Event">Event</option>
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Announcement Images (Max 3)</label>
                  <div className="flex flex-wrap gap-4">
                    {tempImages.map((img, idx) => (
                      <div key={idx} className="relative group w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 border-2 border-gray-100 shadow-sm">
                        <img src={img} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                    {tempImages.length < 3 && (
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center hover:border-emerald-500 hover:bg-emerald-50 transition-all text-gray-400 hover:text-emerald-600"
                      >
                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        <span className="text-[10px] font-bold uppercase mt-1">Upload</span>
                      </button>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" multiple className="hidden" />
                </div>

                <div className="flex-1 min-h-[200px] flex flex-col">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Content Body</label>
                  <textarea 
                    name="content" 
                    required 
                    value={draftContent}
                    onChange={e => setDraftContent(e.target.value)}
                    placeholder="Write the full announcement details here..."
                    className="flex-1 w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-3xl focus:border-emerald-500 outline-none resize-none font-medium text-gray-700 leading-relaxed"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                  <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-8 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-all">Discard Draft</button>
                  <button type="submit" className="bg-emerald-600 text-white px-12 py-3 rounded-2xl font-black text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all">Publish Announcement</button>
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
