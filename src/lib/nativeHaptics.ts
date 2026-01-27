import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const hapticImpact = async (style: 'light' | 'medium' | 'heavy' = 'light'): Promise<void> => {
  try {
    if (Capacitor.getPlatform() === 'web') return;
    const impactStyle =
      style === 'heavy' ? ImpactStyle.Heavy : style === 'medium' ? ImpactStyle.Medium : ImpactStyle.Light;
    await Haptics.impact({ style: impactStyle });
  } catch {
  }
};

