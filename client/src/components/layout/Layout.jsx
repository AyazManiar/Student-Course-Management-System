import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import '../../styles/layout.css';

const Layout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="layout">
      {user && <Sidebar />}
      <div className="layout-right">
        <Navbar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
