import { useState, useEffect } from 'react';
import ProductCardSkeleton from './ProductCardSkeleton';

const CardPreloader = ({ imageUrl, children }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Reset on every imageUrl change
    setIsLoaded(false);

    if (!imageUrl) {
      setIsLoaded(true);
      return;
    }

    let isMounted = true;
    const img = new Image();

    img.onload = () => { if (isMounted) setIsLoaded(true); };
    img.onerror = () => { if (isMounted) setIsLoaded(true); };

    img.src = imageUrl;

    return () => { isMounted = false; };
  }, [imageUrl]);

  if (!isLoaded) return <ProductCardSkeleton />;

  return children;
};

export default CardPreloader;
