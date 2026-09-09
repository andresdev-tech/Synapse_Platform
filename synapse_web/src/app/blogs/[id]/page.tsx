'use client';

import { use } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TemplatePage({ params }: PageProps) {
  const { id } = use(params);
  
  return (
    <div className='bg-white h-screen w-screen'>
        <header>

        </header>
        <main>
          <h1>user id is: {id}</h1>
        </main>
        <footer>

        </footer>
    </div>
  )
}
