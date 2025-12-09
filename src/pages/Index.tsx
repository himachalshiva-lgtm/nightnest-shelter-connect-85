import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from './Login';
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return <Login />;
};

export default Index;
