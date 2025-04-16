
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  // Rediriger vers la page de connexion
  useEffect(() => {
    navigate('/login');
  }, [navigate]);
  
  return null;
};

export default Index;
