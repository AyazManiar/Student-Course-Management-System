import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import '../../styles/layout.css';

const Layout = ({ children }) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="layout">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="layout-body">
        {user && <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
