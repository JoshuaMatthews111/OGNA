import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Platform, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  Volume2, 
  VolumeX,
  Circle as RecordIcon,
  StopCircle,
  Clipboard
} from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import Colors from '@/constants/colors';
import { useCallStore } from '@/store/callStore';
import { UserProfile } from '@/types';

const mockUser: UserProfile = {
  id: '1',
  name: 'Sarah Matthews',
  email: 'sarah@example.com',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
  bio: 'Follower of Christ',
  location: 'Mentor, OH',
  joinDate: '2023-06-15T10:00:00Z',
  role: 'member',
  isOnline: true,
  lastSeen: '2024-01-20T16:00:00Z',
  groups: ['1', '2'],
  followers: ['2', '3'],
  following: ['2', '4'],
  postsCount: 15,
  testimoniesCount: 3,
  prayerRequestsCount: 2,
  privacy: {
    showEmail: false,
    showLocation: true,
    allowDirectMessages: true,
    showOnlineStatus: true,
  },
};

export default function CallScreen() {
  const { id, type } = useLocalSearchParams();
  const [permission, requestPermission] = useCameraPermissions();
  const [audioPermission, setAudioPermission] = useState<boolean>(false);
  const [callTimer, setCallTimer] = useState<number>(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [showNotesModal, setShowNotesModal] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const {
    currentCall,
    isMuted,
    isSpeakerOn,
    isVideoEnabled,
    isRecording,
    callDuration,
    startCall,
    endCall,
    toggleMute,
    toggleSpeaker,
    toggleVideo,
    toggleRecording,
    updateDuration,
  } = useCallStore();

  useEffect(() => {
    initializeCall();
    requestAudioPermission();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      cleanupCall();
    };
  }, []);

  useEffect(() => {
    if (currentCall?.status === 'active') {
      timerRef.current = setInterval(() => {
        setCallTimer((prev) => {
          const newTime = prev + 1;
          updateDuration(newTime);
          return newTime;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentCall?.status]);

  const requestAudioPermission = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setAudioPermission(status === 'granted');
      
      if (status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
        });
      }
    } catch (error) {
      console.error('Error requesting audio permission:', error);
    }
  };

  const initializeCall = () => {
    if (!currentCall) {
      startCall({
        callerId: 'current-user',
        callerName: 'You',
        callerAvatar: undefined,
        receiverId: id as string,
        receiverName: mockUser.name,
        receiverAvatar: mockUser.avatar,
        type: (type as 'audio' | 'video') || 'audio',
        startTime: new Date().toISOString(),
        endTime: undefined,
        isRecording: false,
        notes: undefined,
        transcription: undefined,
        recordingUrl: undefined,
      });

      setTimeout(() => {
        useCallStore.getState().updateCallStatus('active');
      }, 2000);
    }
  };

  const cleanupCall = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    }
    
    if (Platform.OS !== 'web') {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });
      } catch (error) {
        console.error('Error resetting audio mode:', error);
      }
    }
  };

  const handleEndCall = async () => {
    if (isRecording) {
      await handleStopRecording();
    }
    
    await cleanupCall();
    endCall();
    router.back();
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      await handleStopRecording();
    } else {
      await handleStartRecording();
    }
  };

  const handleStartRecording = async () => {
    try {
      if (!audioPermission) {
        Alert.alert('Permission Required', 'Please grant audio permission to record calls.');
        return;
      }

      if (Platform.OS === 'web') {
        Alert.alert('Not Available', 'Call recording is not available on web.');
        return;
      }

      const { recording: newRecording } = await Audio.Recording.createAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {},
      });

      setRecording(newRecording);
      toggleRecording();
      console.log('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const handleStopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri && currentCall) {
        useCallStore.getState().addRecording({
          id: `rec-${Date.now()}`,
          callId: currentCall.id,
          audioUrl: uri,
          duration: callDuration,
          createdAt: new Date().toISOString(),
        });
        
        console.log('Recording saved:', uri);
      }
      
      setRecording(null);
      toggleRecording();
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to save recording.');
    }
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallStatusText = (): string => {
    if (!currentCall) return 'Connecting...';
    
    switch (currentCall.status) {
      case 'calling':
        return 'Calling...';
      case 'ringing':
        return 'Ringing...';
      case 'active':
        return formatTime(callTimer);
      default:
        return 'Connecting...';
    }
  };

  if (type === 'video' && permission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera permission required</Text>
      </View>
    );
  }

  if (type === 'video' && permission && !permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need camera permission for video calls</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {type === 'video' && isVideoEnabled && Platform.OS !== 'web' ? (
        <CameraView style={styles.videoContainer} facing="front">
          <View style={styles.videoOverlay}>
            <View style={styles.videoHeader}>
              <Text style={styles.participantName}>{mockUser.name}</Text>
              <Text style={styles.callStatus}>{getCallStatusText()}</Text>
            </View>
          </View>
        </CameraView>
      ) : (
        <View style={styles.audioContainer}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: mockUser.avatar }} style={styles.avatar} />
            <View style={styles.callInfo}>
              <Text style={styles.participantName}>{mockUser.name}</Text>
              <Text style={styles.callStatus}>{getCallStatusText()}</Text>
              {isRecording && (
                <View style={styles.recordingIndicator}>
                  <View style={styles.recordingDot} />
                  <Text style={styles.recordingText}>Recording</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.controlButton, isSpeakerOn && styles.controlButtonActive]}
          onPress={toggleSpeaker}
        >
          {isSpeakerOn ? (
            <Volume2 size={28} color={Colors.dark.background} />
          ) : (
            <VolumeX size={28} color={Colors.dark.text} />
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlButton, isMuted && styles.controlButtonActive]}
          onPress={toggleMute}
        >
          {isMuted ? (
            <MicOff size={28} color={Colors.dark.background} />
          ) : (
            <Mic size={28} color={Colors.dark.text} />
          )}
        </TouchableOpacity>

        {type === 'video' && (
          <TouchableOpacity 
            style={[styles.controlButton, !isVideoEnabled && styles.controlButtonActive]}
            onPress={toggleVideo}
          >
            {isVideoEnabled ? (
              <VideoIcon size={28} color={Colors.dark.text} />
            ) : (
              <VideoOff size={28} color={Colors.dark.background} />
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.controlButton, isRecording && styles.recordingButton]}
          onPress={handleToggleRecording}
        >
          {isRecording ? (
            <StopCircle size={28} color={Colors.dark.background} />
          ) : (
            <RecordIcon size={28} color={Colors.dark.text} />
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => setShowNotesModal(true)}
        >
          <Clipboard size={28} color={Colors.dark.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.endCallContainer}>
        <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
          <PhoneOff size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      {showNotesModal && (
        <CallNotesModal
          visible={showNotesModal}
          onClose={() => setShowNotesModal(false)}
          callId={currentCall?.id || ''}
        />
      )}
    </SafeAreaView>
  );
}

function CallNotesModal({ visible, onClose, callId }: { visible: boolean; onClose: () => void; callId: string }) {
  const [notes, setNotes] = useState<string>('');
  const { updateCallNotes } = useCallStore();

  const handleSave = () => {
    updateCallNotes(notes);
    onClose();
  };

  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Call Notes</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalClose}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Add notes about this call:</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder="Type your notes here..."
            placeholderTextColor={Colors.dark.subtext}
          />
        </View>

        <View style={styles.modalActions}>
          <TouchableOpacity style={styles.modalButton} onPress={onClose}>
            <Text style={styles.modalButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={handleSave}>
            <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: Colors.dark.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: Colors.dark.background,
    fontSize: 16,
    fontWeight: '600',
  },
  videoContainer: {
    flex: 1,
  },
  videoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  videoHeader: {
    padding: 20,
    alignItems: 'center',
  },
  audioContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
  },
  callInfo: {
    alignItems: 'center',
  },
  participantName: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  callStatus: {
    fontSize: 16,
    color: Colors.dark.subtext,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ef4444',
    borderRadius: 12,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonActive: {
    backgroundColor: Colors.dark.accent,
  },
  recordingButton: {
    backgroundColor: '#ef4444',
  },
  endCallContainer: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  endCallButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  modalClose: {
    fontSize: 24,
    color: Colors.dark.subtext,
  },
  notesContainer: {
    marginBottom: 24,
  },
  notesLabel: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    padding: 12,
    color: Colors.dark.text,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.dark.background,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: Colors.dark.accent,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  modalButtonTextPrimary: {
    color: Colors.dark.background,
  },
});
