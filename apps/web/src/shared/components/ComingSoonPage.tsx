import React from 'react';
import { Hammer } from 'lucide-react';

export default function ComingSoonPage(): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] text-center px-4">
      <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
        <Hammer className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-bold text-foreground mb-3 tracking-tight">Feature in Development</h1>
      <p className="text-muted-foreground max-w-md mx-auto text-lg">
        We're working hard to bring this feature to your portal. Check back soon for updates!
      </p>
    </div>
  );
}
