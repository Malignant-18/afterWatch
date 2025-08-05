// CustomToasts.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Toast from 'react-native-toast-message';

import { ToastProps, BaseToastProps, ShowToastOptions } from '../types/toast';

const { width } = Dimensions.get('window');

// Custom Toast Components for different types
const BaseToast: React.FC<BaseToastProps> = ({ text1, text2, onPress, colors, icon, props }) => (
  <TouchableOpacity
    className=" overflow-hidden rounded-lg shadow-lg"
    style={{
      backgroundColor: colors[0],
      width: width - 32,
    }}
    onPress={onPress}
    activeOpacity={0.9}>
    {/* Gradient overlay effect */}
    <View className="absolute inset-0 opacity-10" style={{ backgroundColor: colors[1] }} />
    <View className="flex-row items-start px-4 py-3 pt-4">
      {icon && (
        <View className="mr-3 mt-0.5 h-6 w-6 items-center justify-center">
          <Text className="text-md font-bold text-white text-opacity-90">{icon}</Text>
        </View>
      )}

      {/* Text content */}
      <View className="flex-1 pr-2">
        {text1 && (
          <Text className="mb-0.5 mt-[2px] font-montserrat text-[14px] leading-5 text-gray-600">
            {text1}
          </Text>
        )}
        {text2 && (
          <Text className="text-sm leading-[18px] text-dark-800 text-opacity-90">{text2}</Text>
        )}

        {/* Action button */}
        {props?.actionLabel && props?.onActionPress && (
          <TouchableOpacity
            className="mt-2 self-start py-1"
            onPress={props.onActionPress}
            activeOpacity={0.7}>
            <Text className="text-sm font-semibold text-white text-opacity-90 underline">
              {props.actionLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Close indicator */}
      <TouchableOpacity onPress={() => Toast.hide()} activeOpacity={0.7}>
        <View className="h-7 w-7 items-center justify-center rounded-full">
          <Ionicons name="close" size={20} color="black" />
        </View>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

// Success Toast (Login, Signup, etc.)
const SuccessToast: React.FC<ToastProps> = (props) => (
  <BaseToast {...props} colors={['#FDFBFA', '#EBD4B9']} icon="✓" />
);

// Error Toast
const ErrorToast: React.FC<ToastProps> = (props) => (
  <BaseToast {...props} colors={['#ef4444', '#dc2626']} icon="✕" />
);

// Rating Toast
const RatingToast: React.FC<ToastProps> = (props) => (
  <BaseToast {...props} colors={['#FDFBFA', '#0a0502']} />
);

// Comment Toast
const CommentToast: React.FC<ToastProps> = (props) => (
  <BaseToast {...props} colors={['#8b5cf6', '#7c3aed']} icon="💬" />
);

// Login Toast
const LoginToast: React.FC<ToastProps> = (props) => (
  <BaseToast {...props} colors={['#6366f1', '#4f46e5']} icon="🔑" />
);

// Signup Toast
const SignupToast: React.FC<ToastProps> = (props) => (
  <BaseToast {...props} colors={['#06b6d4', '#0891b2']} icon="👋" />
);

// Info Toast
const InfoToast: React.FC<ToastProps> = (props) => (
  <BaseToast {...props} colors={['#3b82f6', '#2563eb']} icon="ℹ" />
);

// Warning Toast
const WarningToast: React.FC<ToastProps> = (props) => (
  <BaseToast {...props} colors={['#f59e0b', '#d97706']} icon="⚠" />
);

// Toast configuration object
export const toastConfig = {
  success: (props: ToastProps) => <SuccessToast {...props} />,
  error: (props: ToastProps) => <ErrorToast {...props} />,
  rating: (props: ToastProps) => <RatingToast {...props} />,
  comment: (props: ToastProps) => <CommentToast {...props} />,
  login: (props: ToastProps) => <LoginToast {...props} />,
  signup: (props: ToastProps) => <SignupToast {...props} />,
  info: (props: ToastProps) => <InfoToast {...props} />,
  warning: (props: ToastProps) => <WarningToast {...props} />,
};

// Utility functions for easy toast usage with proper TypeScript
export const showToast = {
  // Custom toast with full control
  custom: (
    type: keyof typeof toastConfig,
    title: string,
    message?: string,
    actionLabel?: string,
    onActionPress?: () => void,
    options: ShowToastOptions = {}
  ) => {
    Toast.show({
      type,
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 4000,
      topOffset: 60,
      props:
        actionLabel && onActionPress
          ? {
              actionLabel,
              onActionPress,
            }
          : undefined,
      ...options,
    });
  },
};
