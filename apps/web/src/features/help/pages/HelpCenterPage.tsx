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
    queryFn: () => kbApi.getArticlesByCategory(selectedCategory),
    enabled: !!selectedCategory,
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-primary p-10 text-center text-primary-foreground shadow-lg">
        <div className="relative z-10">
          <HelpCircle className="mx-auto mb-4 h-12 w-12 opacity-90" />
          <h1 className="mb-3 text-3xl font-bold tracking-tight">How can we help?</h1>
          <p className="mx-auto mb-8 max-w-xl text-lg text-primary-foreground/80">
            Search our knowledge base or browse categories below to find answers.
          </p>
          <div className="relative mx-auto max-w-2xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for articles..."
              className="w-full rounded-xl py-4 pl-12 pr-4 text-foreground shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/20"
            />
          </div>
        </div>
        {/* Background Decorative Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent opacity-10"></div>
      </div>

      {!selectedCategory ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Browse Categories</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoadingCats ? (
              <div className="col-span-full flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              </div>
            ) : categories.length === 0 ? (
              <div className="col-span-full rounded-xl border border-dashed border-border bg-muted/30 py-12 text-center text-muted-foreground">
                No categories available at the moment.
              </div>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="group cursor-pointer rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <Book className="mb-4 h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                  <h3 className="mb-2 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                    {category.name}
                  </h3>
                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                    {category.description}
                  </p>
                  <div className="flex items-center text-sm font-medium text-primary">
                    View Articles{' '}
                    <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <button
              onClick={() => setSelectedCategory(null)}
              className="transition-colors hover:text-primary"
            >
              Help Center
            </button>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Articles</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground">Articles</h2>

          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {isLoadingArts ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              </div>
            ) : articles.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No articles found in this category.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {articles.map((article) => (
                  <li
                    key={article.id}
                    className="group cursor-pointer p-6 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 rounded-lg bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="mb-1 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                          {article.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{article.excerpt}</p>
                        <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
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
