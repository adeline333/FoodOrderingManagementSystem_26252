import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Topbar } from '../components/common/Topbar';
import { Footer } from '../components/common/Footer';
import { useState } from 'react';

export const MainLayout = () => {
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  
  const handleGlobalSearch = (query) => {
    setGlobalSearchQuery(query);
    // You can implement global search logic here
    console.log('Global search:', query);
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onSearch={handleGlobalSearch} />
        
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            <Outlet context={{ globalSearchQuery }} />
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};