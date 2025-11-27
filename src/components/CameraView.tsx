import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as ExpoCamera from 'expo-camera';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useCamera } from '../context/CameraContext';
import { useToast } from '../hooks/useToast';

interface CameraViewProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (photo: { uri: string; name: string; type: string }) => void;
}

export default function CameraView({ visible, onClose, onCapture }: CameraViewProps) {
  const { COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const { setIsCameraOpen } = useCamera();
  const [cameraType, setCameraType] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const cameraRef = useRef<any>(null);
  const toast = useToast();
  const CameraViewImpl: any = (ExpoCamera as any).CameraView;
  const CameraImpl: any = CameraViewImpl || (ExpoCamera as any).Camera;

  useEffect(() => {
    setIsCameraOpen(visible);
    return () => {
      setIsCameraOpen(false);
    };
  }, [visible, setIsCameraOpen]);

  if (!visible) {
    return null;
  }

  const capturePhoto = async () => {
    try {
      if (!cameraRef.current) return;
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false
      });
      if (!photo?.uri) return;

      const uri = photo.uri;
      const ext = 'jpg';
      const name = `photo_${Date.now()}.${ext}`;
      const type = `image/${ext}`;

      onCapture({ uri, name, type });
      onClose();
    } catch (error: any) {
      toast.handleApiError(error, error?.data?.message || 'Erro ao capturar foto');
    }
  };

  return (
    <View style={styles.cameraOverlay}>
      {CameraImpl ? (
        <CameraImpl
          ref={(r: any) => (cameraRef.current = r)}
          style={styles.cameraPreview}
          {...(CameraViewImpl
            ? { facing: cameraType, enableTorch: flash === 'on' }
            : { type: cameraType })}
        />
      ) : (
        <View style={[styles.cameraPreview, styles.cameraUnavailable]}>
          <Text style={styles.cameraUnavailableText}>Câmera indisponível</Text>
        </View>
      )}

      <View style={styles.cameraTopBar}>
        <TouchableOpacity
          style={styles.roundBtn}
          onPress={onClose}
          accessibilityLabel="Fechar câmera"
        >
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.roundBtn}
          onPress={() => setFlash(prev => (prev === 'off' ? 'on' : 'off'))}
          accessibilityLabel="Alternar flash"
        >
          <Ionicons
            name={flash === 'off' ? 'flash-off' : 'flash'}
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cameraBottomBar}>
        <TouchableOpacity
          style={styles.roundBtn}
          onPress={() => setCameraType(prev => (prev === 'back' ? 'front' : 'back'))}
          accessibilityLabel="Alternar câmera"
        >
          <MaterialIcons name="flip-camera-android" size={50} color={COLORS.text} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={capturePhoto}
          accessibilityLabel="Capturar foto"
          accessibilityRole="button"
        >
          <View style={styles.captureOuter}>
            <View style={styles.captureInner} />
          </View>
        </TouchableOpacity>

        <View style={{ width: 74 }} />
      </View>
    </View>
  );
}

function makeStyles(COLORS: any) {
  return StyleSheet.create({
    cameraOverlay: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'black',
      zIndex: 9999,
      elevation: 9999,
    },
    cameraPreview: {
      ...StyleSheet.absoluteFillObject,
    },
    cameraUnavailable: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    cameraUnavailableText: {
      color: COLORS.text,
      fontWeight: '700',
      fontSize: 16,
    },
    cameraTopBar: {
      position: 'absolute',
      top: 24,
      left: 16,
      right: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cameraBottomBar: {
      position: 'absolute',
      bottom: 32,
      left: 16,
      right: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    roundBtn: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
    },
    captureOuter: {
      width: 74,
      height: 74,
      borderRadius: 37,
      borderWidth: 4,
      borderColor: COLORS.text,
      alignItems: 'center',
      justifyContent: 'center',
    },
    captureInner: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: COLORS.text,
    },
  });
}

