import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { kbApi } from '../api/kb.api';
import { Book, ChevronRight, HelpCircle, FileText, Search } from 'lucide-react';

export default function HelpCenterPage(): React.ReactElement {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categories = [], isLoading: isLoadingCats } = useQuery({
    queryKey: ['kb-categories'],
    queryFn: kbApi.getCategories,
  });

  const { data: articles = [], isLoading: isLoadingArts } = useQuery({
    queryKey: ['kb-articles', selectedCategory],
    queryFn: () => kbApi.getArticlesByCategory(selectedCategory!),
    enabled: !!selectedCategory,
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground rounded-2xl p-10 text-center shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h1 className="text-3xl font-bold mb-3 tracking-tight">How can we help?</h1>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto text-lg">Search our knowledge base or browse categories below to find answers.</p>
          <div className="max-w-2xl mx-auto relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search for articles..." 
              className="w-full pl-12 pr-4 py-4 rounded-xl text-foreground focus:outline-none focus:ring-4 focus:ring-primary/20 shadow-sm"
            />
          </div>
        </div>
        {/* Background Decorative Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
      </div>

      {!selectedCategory ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Browse Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingCats ? (
              <div className="col-span-full flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : categories.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-border">
                No categories available at the moment.
              </div>
            ) : (
              categories.map(category => (
                <div 
                  key={category.id} 
                  onClick={() => setSelectedCategory(category.id)}
                  className="bg-card border border-border rounded-xl p-6 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
                >
                  <Book className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{category.description}</p>
                  <div className="flex items-center text-sm font-medium text-primary">
                    View Articles <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <button onClick={() => setSelectedCategory(null)} className="hover:text-primary transition-colors">Help Center</button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">Articles</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground">Articles</h2>
          
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            {isLoadingArts ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No articles found in this category.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {articles.map(article => (
                  <li key={article.id} className="p-6 hover:bg-muted/30 transition-colors cursor-pointer group">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-lg text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{article.title}</h3>
                        <p className="text-sm text-muted-foreground">{article.excerpt}</p>
                        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                          {article.viewCount} views
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
