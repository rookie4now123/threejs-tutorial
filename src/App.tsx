//import './App.css'
import React, { useState } from 'react';
import { navItems, getIcon } from './navItems';
import { NavLink, Outlet, useLocation } from 'react-router';
const App = () => {
  const location = useLocation();
  const currentScene = navItems.find(item => item.path === location.pathname) || navItems[0];

  return (
    <div className="flex h-screen w-screen bg-black text-gray-100 font-sans selection:bg-purple-500 selection:text-white overflow-hidden">
      
      {/* Left Navigation Sidebar */}
      <nav className="w-72 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col z-20 flex-shrink-0">
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-red-600 to-black-600 p-2.5 rounded-xl shadow-lg shadow-purple-500/20">
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Lumina
              </h1>
              <p className="text-[10px] text-gray-500 tracking-widest uppercase font-semibold">3D Portfolio</p>
            </div>
          </div>
        </div>

        {/* Navigation Links List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          <p className="px-4 py-3 text-[11px] font-bold text-blue-500 uppercase tracking-widest">Scenes</p>
          {navItems.map(item => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => {
                const baseClasses = 'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden text-sm';
                const activeClasses = 'bg-white/10 text-white shadow-md border border-white/5 font-medium';
                const inactiveClasses = 'text-gray-400 hover:text-white hover:bg-white/5 hover:translate-x-1';

                return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
              }}
            >
               <span className="relative z-10 flex items-center gap-3">
                {getIcon(item.id)}
                <span>{item.title}</span>
              </span>
              
              {/* Active Indicator Dot */}
              <NavLink to={item.path} className={({ isActive }) => isActive ? "absolute right-3 w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.8)]" : "hidden"}>
                 {/* Empty content, just for class logic */}
              </NavLink>
            </NavLink>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 bg-black/20">
            <a href="#" className="flex items-center justify-between px-2 py-2 text-xs text-gray-500 hover:text-white transition-colors">
                <div className="flex items-center gap-2">
                  <span>View Source</span>
                </div>
            </a>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden bg-[#050505]">
        
        {/* Top Header Overlay */}
        <div className="absolute top-0 left-0 right-0 p-8 z-10 pointer-events-none flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
            <div className="pointer-events-auto">
             <p className="text-gray-400 text-sm max-w-lg mt-2 font-light leading-relaxed backdrop-blur-sm">
                  {currentScene.description}
                </p>
            </div>
            
            <div className="pointer-events-auto flex items-center gap-4">
                 <div className="px-3 py-1.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-md text-[10px] font-mono text-green-400 flex items-center gap-2 shadow-xl">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    RENDER ACTIVE
                 </div>
            </div>
        </div>

        {/* Three.js Content Outlet */}
        <div className="w-full h-full relative z-0">
          <Outlet />
        </div>

        {/* Gemini Assistant Overlay */}

      </main>
    </div>
  );
};

export default App;

// import React, { useState } from 'react';
// import { navItems } from './navItems'; // Assuming this file is in the same directory
// import { NavLink, Outlet } from 'react-router-dom';

// const App = () => {
//   // State to control the visibility of the nav on mobile
//   const [isNavOpen, setIsNavOpen] = useState(false);

//   const toggleNav = () => setIsNavOpen(!isNavOpen);
//   const closeNav = () => setIsNavOpen(false);

//   return (
//     // Main container
//     // On desktop (md and up), it's a flex row.
//     <div className="flex h-screen bg-gray-50 font-sans">
      
//       {/* --- Navigation Sidebar --- */}
//       {/* Mobile-first: default is hidden off-screen, fixed position, full height */}
//       {/* Desktop (md): becomes visible, relative position, fixed width */}
//       <nav
//         className={`
//           fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-20
//           transform transition-transform duration-300 ease-in-out
//           flex flex-col p-5
//           md:relative md:translate-x-0 md:w-52
//           ${isNavOpen ? 'translate-x-0' : '-translate-x-full'}
//         `}
//       >
//         <div className="text-xl font-bold mb-10">MyApp</div> {/* Optional: Add a title */}
        
//         {navItems.map(item => (
//           <NavLink
//             key={item.id}
//             to={item.path}
//             onClick={closeNav} // Close nav on item click for mobile
//             className={({ isActive }) => {
//               const baseClasses = 'block py-2.5 px-4 rounded-lg transition duration-200 mb-2';
//               const activeClasses = 'bg-blue-500 text-white font-semibold shadow';
//               const inactiveClasses = 'hover:bg-gray-100 text-gray-700';
//               return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
//             }}
//           >
//             {item.title}
//           </NavLink>
//         ))}
//       </nav>

//       {/* --- Main Content --- */}
//       <main className="flex-1 overflow-y-auto">
//         {/* --- Hamburger Menu Button --- */}
//         {/* Visible only on mobile (hidden on md screens and up) */}
//         <button
//           onClick={toggleNav}
//           className="md:hidden fixed top-4 left-4 z-30 p-2 bg-white rounded-md shadow"
//           aria-label="Open navigation"
//         >
//           {/* Simple hamburger icon */}
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="h-6 w-6"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M4 6h16M4 12h16m-7 18h7" // A common hamburger path
//             />
//           </svg>
//         </button>
        
//         {/* The Outlet renders the matched child route */}
//         {/* Add padding for content, especially on mobile to not be under the hamburger */}
//         <div className="p-4 pt-20 md:pt-4">
//             <Outlet />
//         </div>
//       </main>
      
//       {/* Optional: Overlay for mobile to close nav on outside click */}
//       {isNavOpen && (
//         <div
//           onClick={closeNav}
//           className="md:hidden fixed inset-0 bg-black/30 z-10"
//         ></div>
//       )}
//     </div>
//   );
// };

// export default App;