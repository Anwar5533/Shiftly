import React from 'react';
import { Hammer } from 'lucide-react';

export default function ComingSoonPage(): React.ReactElement {
  return (
    <div className="flex h-[calc(100vh-140px)] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Hammer className="h-10 w-10" />
      </div>
      <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground">
        Feature in Development
      </h1>
      <p className="mx-auto max-w-md text-lg text-muted-foreground">
        We're working hard to bring this feature to your portal. Check back soon for updates!
      </p>
    </div>
  );
}
