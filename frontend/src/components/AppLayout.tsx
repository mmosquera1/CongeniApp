import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuthContext } from '../context/AuthContext';

interface AppLayoutProps {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}

export default function AppLayout({ title, actions, children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div>
      <header style={headerStyle}>
        <div className="container" style={headerInnerStyle}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.65rem' }}>CongeniApp</h1>
            <p style={{ margin: '0.25rem 0 0', color: '#5a6b7d' }}>
              Comunidad conectada, soluciones compartidas
            </p>
          </div>
          <nav style={navStyle}>
            <Link style={linkStyle(location.pathname === '/')} to="/">
              Inicio
            </Link>
            <Link style={linkStyle(location.pathname === '/reviews/new')} to="/reviews/new">
              Nueva reseña
            </Link>
            <Link style={linkStyle(location.pathname === '/services')} to="/services">
              Servicios
            </Link>
            <Link style={linkStyle(location.pathname === '/marketplace')} to="/marketplace">
              Mercado
            </Link>
            <Link style={linkStyle(location.pathname === '/register')} to="/register">
              Mi perfil
            </Link>
          </nav>
          <div style={{ textAlign: 'right' }}>
            {user && (
              <>
                <p style={{ margin: 0, fontWeight: 600 }}>{user.email}</p>
                <button className="btn btn-secondary" onClick={handleLogout} style={{ marginTop: '0.5rem' }}>
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="container" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <div>{actions}</div>
        </div>
        {children}
      </main>
    </div>
  );
}

const headerStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #233a96, #4c6ef5)',
  color: '#ffffff',
  padding: '1.5rem 0',
  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.15)'
};

const headerInnerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '1.5rem'
};

const navStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'center'
};

const linkStyle = (active: boolean): React.CSSProperties => ({
  padding: '0.5rem 0.75rem',
  borderRadius: '999px',
  background: active ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
  color: '#fff',
  fontWeight: 600
});
