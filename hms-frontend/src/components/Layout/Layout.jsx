import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-surface-bright text-on-surface font-body-md antialiased transition-colors duration-200">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main
        className="transition-sidebar min-h-screen pr-6 pb-12 pt-4"
        style={{ marginLeft: collapsed ? '112px' : '320px' }}
      >
        <Header />
        <div className="max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
