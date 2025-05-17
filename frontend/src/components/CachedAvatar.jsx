import React, { useMemo } from 'react';
import { Avatar } from '@chakra-ui/react';

// Use a plain object to cache avatars
const avatarCache = {};

const CachedAvatar = ({ src, name, size = "sm", ...props }) => {
  // Create cache key
  const cacheKey = src || name || 'default';
  
  // Use useMemo to cache Avatar component instances
  return useMemo(() => {
    // Check cache
    if (cacheKey && avatarCache[cacheKey]) {
      return avatarCache[cacheKey];
    }
    
    const avatar = (
      <Avatar.Root size={size} {...props}>
        <Avatar.Fallback name={name} />
        <Avatar.Image src={src} />
      </Avatar.Root>
    );
    
    // Store in cache
    if (cacheKey) {
      avatarCache[cacheKey] = avatar;
    }
    
    return avatar;
  }, [src, name, size, cacheKey]);
};

export default React.memo(CachedAvatar);