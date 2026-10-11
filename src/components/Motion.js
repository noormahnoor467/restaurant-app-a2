import React, { useEffect, useRef } from 'react';
import { Animated, AccessibilityInfo } from 'react-native';
export default function Motion({ children }) {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (!reduced && mounted) {
        opacity.setValue(0);
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }).start();
      }
    });
    return () => {
      mounted = false;
    };
  }, [opacity]);
  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
}
