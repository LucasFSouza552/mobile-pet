import Toast from 'react-native-toast-message';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastOptions {
  text1: string;
  text2?: string;
  position?: 'top' | 'bottom';
  visibilityTime?: number;
  autoHide?: boolean;
  topOffset?: number;
  bottomOffset?: number;
}

export const showSuccessToast = (options: ToastOptions) => {
  Toast.show({
    type: 'success',
    text1: options.text1,
    text2: options.text2,
    position: options.position || 'top',
    visibilityTime: options.visibilityTime || 2500,
    autoHide: options.autoHide !== false,
    topOffset: options.topOffset || 60,
    bottomOffset: options.bottomOffset || 40,
  });
};

export const showErrorToast = (options: ToastOptions) => {
  Toast.show({
    type: 'error',
    text1: options.text1,
    text2: options.text2,
    position: options.position || 'top',
    visibilityTime: options.visibilityTime || 3000,
    autoHide: options.autoHide !== false,
    topOffset: options.topOffset || 60,
    bottomOffset: options.bottomOffset || 40,
  });
};

export const showInfoToast = (options: ToastOptions) => {
  Toast.show({
    type: 'info',
    text1: options.text1,
    text2: options.text2,
    position: options.position || 'top',
    visibilityTime: options.visibilityTime || 2500,
    autoHide: options.autoHide !== false,
    topOffset: options.topOffset || 60,
    bottomOffset: options.bottomOffset || 40,
  });
};

export const showToast = (type: ToastType, options: ToastOptions) => {
  switch (type) {
    case 'success':
      showSuccessToast(options);
      break;
    case 'error':
      showErrorToast(options);
      break;
    case 'info':
      showInfoToast(options);
      break;
  }
};

export const hideToast = () => {
  Toast.hide();
};

