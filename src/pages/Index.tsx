import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from './Login';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('nightnest_user');
    if (user) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return <Login />;
};

export default Index;
