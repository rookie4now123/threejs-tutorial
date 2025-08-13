//import './App.css'
import React, { useState } from 'react';
import { navItems } from './navItems';
import { NavLink, Outlet } from 'react-router';
const App = () => {
  return (
    <div style={styles.container}>
      {/* Left Navigation Pane */}
      <nav style={styles.nav}>
        {navItems.map(item => (
          // Use NavLink instead of a div or Link for automatic active styling
          <NavLink
            key={item.id}
            to={item.path}
            // The style prop can be a function to check if the link is active
            style={({ isActive }) =>
              isActive
                ? { ...styles.navItem, ...styles.activeNavItem }
                : styles.navItem
            }
          >
            {item.title}
          </NavLink>
        ))}
      </nav>

      {/* Right Content Pane - The Outlet renders the matched child route */}
      <main style={styles.content}>
        <Outlet />
      </main>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    fontFamily: 'sans-serif',
    height: '100vh',
    color: '#333',
  },
  nav: {
    width: '200px',
    borderRight: '1px solid #ddd',
    backgroundColor: '#f7f7f7',
    padding: '20px',
    display: 'flex',          // Treat this container as a flexbox
    flexDirection: 'column',  // Stack flex items vertically
  },
  navItem: {
    padding: '12px 15px',
    cursor: 'pointer',
    borderRadius: '5px',
    marginBottom: '5px',
    transition: 'background-color 0.2s ease',
  },
  activeNavItem: {
    backgroundColor: '#007bff',
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1, // Takes up the remaining space
    //padding: '40px',
  },
};

export default App;