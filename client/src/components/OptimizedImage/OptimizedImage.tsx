import React from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  lazy?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height, 
  lazy = true,
  ...props 
}) => {
  let optimizedSrc = src;

  // If the image is from Cloudinary and not already optimized
  if (src.includes('res.cloudinary.com') && !src.includes('f_auto')) {
    // Inject f_auto,q_auto after /upload/
    optimizedSrc = src.replace('/upload/', '/upload/f_auto,q_auto/');
  }

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      {...props}
    />
  );
};

export default OptimizedImage;
