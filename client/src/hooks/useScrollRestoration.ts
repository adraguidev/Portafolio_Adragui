import { useEffect } from 'react';

const useScrollRestoration = () => {
  useEffect(() => {
    const scrollPosition = window.scrollY;

    return () => {
      window.scrollTo(0, scrollPosition);
    };
  }, []);
};

export default useScrollRestoration; 