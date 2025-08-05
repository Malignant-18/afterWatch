// types/toast.ts
export interface ToastProps {
  text1?: string;
  text2?: string;
  onPress?: () => void;
  props?: {
    actionLabel?: string;
    onActionPress?: () => void;
  };
}

export interface BaseToastProps extends ToastProps {
  colors: [string, string];
  icon?: string;
}

export interface ShowToastOptions {
  position?: 'top' | 'bottom';
  visibilityTime?: number;
  autoHide?: boolean;
  topOffset?: number;
  swipeable?: boolean;
  bottomOffset?: number;
  onPress?: () => void;
  props?: {
    actionLabel?: string;
    onActionPress?: () => void;
  };
}
