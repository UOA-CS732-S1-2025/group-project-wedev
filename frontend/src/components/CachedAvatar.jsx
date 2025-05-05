import React, { useMemo } from 'react';
import { Avatar } from '@chakra-ui/react';

// 使用普通对象来缓存头像
const avatarCache = {};

const CachedAvatar = ({ src, name, size = "sm", ...props }) => {
  // 创建缓存键
  const cacheKey = src || name || 'default';
  
  // 使用 useMemo 缓存 Avatar 组件实例
  return useMemo(() => {
    // 检查缓存
    if (cacheKey && avatarCache[cacheKey]) {
      return avatarCache[cacheKey];
    }
    
    const avatar = (
      <Avatar.Root size={size} {...props}>
        <Avatar.Fallback name={name} />
        <Avatar.Image src={src} />
      </Avatar.Root>
    );
    
    // 存入缓存
    if (cacheKey) {
      avatarCache[cacheKey] = avatar;
    }
    
    return avatar;
  }, [src, name, size, cacheKey]);
};

export default React.memo(CachedAvatar);