// Update this page (the content is just a fallback if you fail to update the page)

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the new landing page
    navigate('/', { replace: true });
  }, [navigate]);

  return null;
};

export default Index;
