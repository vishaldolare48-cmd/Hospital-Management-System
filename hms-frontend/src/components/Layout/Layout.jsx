import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-bright text-on-surface font-body-md antialiased transition-colors duration-200">
      <Sidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(!collapsed)} 
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <main
        className={`transition-sidebar min-h-screen pb-12 pt-4 px-4 lg:pr-6 lg:pl-0 ml-0 ${
          collapsed ? 'lg:ml-[112px]' : 'lg:ml-[320px]'
        }`}
      >
        <Header onMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <div className="max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
