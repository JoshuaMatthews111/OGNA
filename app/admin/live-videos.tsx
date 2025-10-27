import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Clipboard,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { 
  ArrowLeft, 
  Plus, 
  Video, 
  Trash2, 
  Calendar, 
  Radio, 
  Key, 
  Copy, 
  Eye, 
  EyeOff,
  Activity,
  Youtube,
  Tv
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { trpc } from '@/lib/trpc';

type StreamType = 'youtube' | 'obs' | 'rtmp';

export default function LiveVideoManagement() {
  const [modalVisible, setModalVisible] = useState(false);
  const [streamKeyModalVisible, setStreamKeyModalVisible] = useState(false);
  const [streamType, setStreamType] = useState<StreamType>('youtube');
  const [videoForm, setVideoForm] = useState({
    title: '',
    streamUrl: '',
    streamKeyId: '',
    scheduledTime: ''
  });
  const [streamKeyName, setStreamKeyName] = useState('');
  const [showStreamKeys, setShowStreamKeys] = useState<{ [key: string]: boolean }>({});

  const { data: content, refetch } = trpc.admin.content.get.useQuery();
  const { data: streamKeys, refetch: refetchStreamKeys } = trpc.admin.content.getStreamKeys.useQuery();
  const liveVideos = content?.liveVideos || [];

  const addLiveVideoMutation = trpc.admin.content.addLiveVideo.useMutation({
    onSuccess: () => {
      refetch();
      setModalVisible(false);
      resetForm();
      Alert.alert('Success', 'Live video scheduled successfully');
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    }
  });

  const deleteLiveVideoMutation = trpc.admin.content.deleteLiveVideo.useMutation({
    onSuccess: () => {
      refetch();
      Alert.alert('Success', 'Live video deleted successfully');
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    }
  });

  const updateLiveVideoStatusMutation = trpc.admin.content.updateLiveVideoStatus.useMutation({
    onSuccess: () => {
      refetch();
      Alert.alert('Success', 'Status updated successfully');
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    }
  });

  const generateStreamKeyMutation = trpc.admin.content.generateStreamKey.useMutation({
    onSuccess: () => {
      refetchStreamKeys();
      setStreamKeyModalVisible(false);
      setStreamKeyName('');
      Alert.alert('Success', 'Stream key generated successfully');
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    }
  });

  const deleteStreamKeyMutation = trpc.admin.content.deleteStreamKey.useMutation({
    onSuccess: () => {
      refetchStreamKeys();
      Alert.alert('Success', 'Stream key deleted successfully');
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    }
  });

  const toggleStreamKeyMutation = trpc.admin.content.toggleStreamKey.useMutation({
    onSuccess: () => {
      refetchStreamKeys();
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    }
  });

  const resetForm = () => {
    setVideoForm({
      title: '',
      streamUrl: '',
      streamKeyId: '',
      scheduledTime: ''
    });
    setStreamType('youtube');
  };

  const handleAddLiveVideo = () => {
    if (!videoForm.title.trim() || !videoForm.scheduledTime.trim()) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    if (streamType === 'youtube' && !videoForm.streamUrl.trim()) {
      Alert.alert('Error', 'Please enter a YouTube URL');
      return;
    }

    if ((streamType === 'obs' || streamType === 'rtmp') && !videoForm.streamKeyId) {
      Alert.alert('Error', 'Please select a stream key');
      return;
    }

    addLiveVideoMutation.mutate({
      ...videoForm,
      streamType,
    });
  };

  const handleDeleteLiveVideo = (videoId: string, title: string) => {
    Alert.alert(
      'Delete Live Video',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteLiveVideoMutation.mutate({ id: videoId })
        }
      ]
    );
  };

  const handleGenerateStreamKey = () => {
    if (!streamKeyName.trim()) {
      Alert.alert('Error', 'Please enter a stream key name');
      return;
    }
    generateStreamKeyMutation.mutate({ name: streamKeyName });
  };

  const handleDeleteStreamKey = (keyId: string, keyName: string) => {
    Alert.alert(
      'Delete Stream Key',
      `Are you sure you want to delete "${keyName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteStreamKeyMutation.mutate({ id: keyId })
        }
      ]
    );
  };

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied', `${label} copied to clipboard`);
  };

  const toggleStreamKeyVisibility = (keyId: string) => {
    setShowStreamKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return '#DC2626';
      case 'scheduled': return '#D97706';
      case 'ended': return '#6B7280';
      default: return colors.dark.subtext;
    }
  };

  const getStreamTypeIcon = (type: string) => {
    switch (type) {
      case 'youtube': return <Youtube size={16} color={colors.dark.accent} />;
      case 'obs': return <Tv size={16} color={colors.dark.accent} />;
      case 'rtmp': return <Activity size={16} color={colors.dark.accent} />;
      default: return <Video size={16} color={colors.dark.accent} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Streaming</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.keyButton}
            onPress={() => setStreamKeyModalVisible(true)}
          >
            <Key size={20} color={colors.dark.accent} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Plus size={20} color={colors.dark.background} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>{liveVideos.length} Streams</Text>
          <Text style={styles.statsText}>{streamKeys?.length || 0} Keys</Text>
        </View>
        
        {liveVideos.map((video) => (
          <View key={video.id} style={styles.videoCard}>
            <View style={styles.videoHeader}>
              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle}>{video.title}</Text>
                <View style={styles.metaRow}>
                  <View style={styles.statusContainer}>
                    <View style={[
                      styles.statusDot, 
                      { backgroundColor: getStatusColor(video.status) }
                    ]} />
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(video.status) }
                    ]}>
                      {video.status.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.streamTypeContainer}>
                    {getStreamTypeIcon(video.streamType)}
                    <Text style={styles.streamTypeText}>{video.streamType.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteLiveVideo(video.id, video.title)}
              >
                <Trash2 size={18} color="#DC2626" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.videoMeta}>
              <View style={styles.metaItem}>
                <Calendar size={14} color={colors.dark.subtext} />
                <Text style={styles.metaText}>
                  {formatDateTime(video.scheduledTime)}
                </Text>
              </View>
            </View>

            {video.streamType === 'youtube' && video.streamUrl && (
              <View style={styles.streamInfo}>
                <Text style={styles.streamLabel}>YouTube URL:</Text>
                <Text style={styles.streamUrl} numberOfLines={2}>
                  {video.streamUrl}
                </Text>
              </View>
            )}

            {(video.streamType === 'obs' || video.streamType === 'rtmp') && video.rtmpUrl && (
              <View style={styles.streamInfo}>
                <Text style={styles.streamLabel}>RTMP Server:</Text>
                <Text style={styles.streamUrl} numberOfLines={1}>
                  {video.rtmpUrl}
                </Text>
                {video.streamKey && (
                  <>
                    <Text style={[styles.streamLabel, { marginTop: 8 }]}>Stream Key:</Text>
                    <Text style={styles.streamUrl} numberOfLines={1}>
                      {String(video.streamKey).substring(0, 20)}...
                    </Text>
                  </>
                )}
              </View>
            )}

            {video.status === 'scheduled' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.goLiveButton}
                  onPress={() => updateLiveVideoStatusMutation.mutate({ id: video.id, status: 'live' })}
                >
                  <Radio size={16} color="#FFF" />
                  <Text style={styles.goLiveButtonText}>Go Live</Text>
                </TouchableOpacity>
              </View>
            )}

            {video.status === 'live' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.endButton}
                  onPress={() => updateLiveVideoStatusMutation.mutate({ id: video.id, status: 'ended' })}
                >
                  <Text style={styles.endButtonText}>End Stream</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {liveVideos.length === 0 && (
          <View style={styles.emptyState}>
            <Video size={48} color={colors.dark.subtext} />
            <Text style={styles.emptyText}>No live videos scheduled</Text>
            <Text style={styles.emptySubtext}>Tap + to schedule your first live stream</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Schedule Live Stream</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Live Stream Title"
              placeholderTextColor={colors.dark.subtext}
              value={videoForm.title}
              onChangeText={(text) => setVideoForm({ ...videoForm, title: text })}
            />

            <Text style={styles.labelText}>Stream Type</Text>
            <View style={styles.streamTypeSelector}>
              <TouchableOpacity
                style={[
                  styles.streamTypeOption,
                  streamType === 'youtube' && styles.streamTypeOptionActive
                ]}
                onPress={() => setStreamType('youtube')}
              >
                <Youtube size={20} color={streamType === 'youtube' ? colors.dark.accent : colors.dark.subtext} />
                <Text style={[
                  styles.streamTypeOptionText,
                  streamType === 'youtube' && styles.streamTypeOptionTextActive
                ]}>YouTube</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.streamTypeOption,
                  streamType === 'obs' && styles.streamTypeOptionActive
                ]}
                onPress={() => setStreamType('obs')}
              >
                <Tv size={20} color={streamType === 'obs' ? colors.dark.accent : colors.dark.subtext} />
                <Text style={[
                  styles.streamTypeOptionText,
                  streamType === 'obs' && styles.streamTypeOptionTextActive
                ]}>OBS</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.streamTypeOption,
                  streamType === 'rtmp' && styles.streamTypeOptionActive
                ]}
                onPress={() => setStreamType('rtmp')}
              >
                <Activity size={20} color={streamType === 'rtmp' ? colors.dark.accent : colors.dark.subtext} />
                <Text style={[
                  styles.streamTypeOptionText,
                  streamType === 'rtmp' && styles.streamTypeOptionTextActive
                ]}>RTMP</Text>
              </TouchableOpacity>
            </View>

            {streamType === 'youtube' ? (
              <>
                <Text style={styles.labelText}>YouTube Live URL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  placeholderTextColor={colors.dark.subtext}
                  value={videoForm.streamUrl}
                  onChangeText={(text) => setVideoForm({ ...videoForm, streamUrl: text })}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
                <View style={styles.infoBox}>
                  <Text style={styles.infoTitle}>📺 YouTube Live Setup:</Text>
                  <Text style={styles.infoText}>1. Go to YouTube Studio → Create → Go Live</Text>
                  <Text style={styles.infoText}>2. Configure your stream settings</Text>
                  <Text style={styles.infoText}>3. Copy the YouTube video URL and paste above</Text>
                  <Text style={styles.infoText}>4. Start streaming with your software</Text>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.labelText}>Select Stream Key</Text>
                <ScrollView style={styles.streamKeyList} nestedScrollEnabled>
                  {streamKeys && streamKeys.length > 0 ? (
                    streamKeys
                      .filter(key => key.isActive)
                      .map((key) => (
                        <TouchableOpacity
                          key={key.id}
                          style={[
                            styles.streamKeyOption,
                            videoForm.streamKeyId === key.id && styles.streamKeyOptionActive
                          ]}
                          onPress={() => setVideoForm({ ...videoForm, streamKeyId: key.id })}
                        >
                          <View style={styles.streamKeyInfo}>
                            <Text style={[
                              styles.streamKeyName,
                              videoForm.streamKeyId === key.id && styles.streamKeyNameActive
                            ]}>{key.name}</Text>
                            <Text style={styles.streamKeyUsage}>
                              Used {key.usageCount} times
                            </Text>
                          </View>
                          {videoForm.streamKeyId === key.id && (
                            <View style={styles.selectedIndicator} />
                          )}
                        </TouchableOpacity>
                      ))
                  ) : (
                    <Text style={styles.noKeysText}>No stream keys available. Create one first.</Text>
                  )}
                </ScrollView>
                <View style={styles.infoBox}>
                  <Text style={styles.infoTitle}>🎥 OBS/RTMP Setup:</Text>
                  <Text style={styles.infoText}>1. Open OBS Studio or your streaming software</Text>
                  <Text style={styles.infoText}>2. Go to Settings → Stream</Text>
                  <Text style={styles.infoText}>3. Use the RTMP server URL and stream key from your selected key</Text>
                  <Text style={styles.infoText}>4. Start streaming to your app!</Text>
                </View>
              </>
            )}

            <Text style={styles.labelText}>Scheduled Time</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD HH:MM (e.g., 2024-01-21 10:00)"
              placeholderTextColor={colors.dark.subtext}
              value={videoForm.scheduledTime}
              onChangeText={(text) => setVideoForm({ ...videoForm, scheduledTime: text })}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.scheduleButton}
                onPress={handleAddLiveVideo}
                disabled={addLiveVideoMutation.isPending}
              >
                <Radio size={16} color={colors.dark.background} />
                <Text style={styles.scheduleButtonText}>
                  {addLiveVideoMutation.isPending ? 'Scheduling...' : 'Schedule'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={streamKeyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setStreamKeyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Stream Keys</Text>
            
            <View style={styles.newKeySection}>
              <TextInput
                style={styles.input}
                placeholder="Stream Key Name (e.g., Main Sanctuary)"
                placeholderTextColor={colors.dark.subtext}
                value={streamKeyName}
                onChangeText={setStreamKeyName}
              />
              <TouchableOpacity
                style={styles.generateButton}
                onPress={handleGenerateStreamKey}
                disabled={generateStreamKeyMutation.isPending}
              >
                <Key size={16} color="#FFF" />
                <Text style={styles.generateButtonText}>
                  {generateStreamKeyMutation.isPending ? 'Generating...' : 'Generate Key'}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.streamKeysList}>
              {streamKeys && streamKeys.length > 0 ? (
                streamKeys.map((key) => (
                  <View key={key.id} style={styles.streamKeyCard}>
                    <View style={styles.streamKeyCardHeader}>
                      <Text style={styles.streamKeyCardName}>{key.name}</Text>
                      <View style={styles.streamKeyActions}>
                        <Switch
                          value={key.isActive}
                          onValueChange={() => toggleStreamKeyMutation.mutate({ id: key.id })}
                          trackColor={{ false: '#4B5563', true: colors.dark.accent }}
                          thumbColor="#FFF"
                        />
                        <TouchableOpacity
                          style={styles.keyDeleteButton}
                          onPress={() => handleDeleteStreamKey(key.id, key.name)}
                        >
                          <Trash2 size={16} color="#DC2626" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.streamKeyDetails}>
                      <View style={styles.keyDetailRow}>
                        <Text style={styles.keyDetailLabel}>RTMP Server:</Text>
                        <View style={styles.keyDetailValue}>
                          <Text style={styles.keyDetailText} numberOfLines={1}>{key.rtmpUrl}</Text>
                          <TouchableOpacity onPress={() => copyToClipboard(key.rtmpUrl, 'RTMP Server URL')}>
                            <Copy size={16} color={colors.dark.accent} />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={styles.keyDetailRow}>
                        <Text style={styles.keyDetailLabel}>Stream Key:</Text>
                        <View style={styles.keyDetailValue}>
                          <Text style={styles.keyDetailText} numberOfLines={1}>
                            {showStreamKeys[key.id] ? key.streamKey : '••••••••••••••••'}
                          </Text>
                          <TouchableOpacity onPress={() => toggleStreamKeyVisibility(key.id)}>
                            {showStreamKeys[key.id] ? (
                              <EyeOff size={16} color={colors.dark.subtext} />
                            ) : (
                              <Eye size={16} color={colors.dark.subtext} />
                            )}
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => copyToClipboard(key.streamKey, 'Stream Key')}>
                            <Copy size={16} color={colors.dark.accent} />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={styles.keyStats}>
                        <Text style={styles.keyStatsText}>Used {key.usageCount} times</Text>
                        {key.lastUsed && (
                          <Text style={styles.keyStatsText}>Last: {formatDateTime(key.lastUsed)}</Text>
                        )}
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyKeys}>
                  <Key size={48} color={colors.dark.subtext} />
                  <Text style={styles.emptyKeysText}>No stream keys yet</Text>
                  <Text style={styles.emptyKeysSubtext}>Generate your first stream key above</Text>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setStreamKeyModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  keyButton: {
    backgroundColor: colors.dark.card,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.dark.accent,
  },
  addButton: {
    backgroundColor: colors.dark.accent,
    padding: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  statsText: {
    fontSize: 16,
    color: colors.dark.subtext,
  },
  videoCard: {
    backgroundColor: colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  videoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark.text,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  streamTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.dark.background,
    borderRadius: 4,
  },
  streamTypeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.dark.accent,
  },
  deleteButton: {
    padding: 4,
  },
  videoMeta: {
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: colors.dark.subtext,
  },
  streamInfo: {
    gap: 4,
    marginTop: 8,
  },
  streamLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.dark.accent,
  },
  streamUrl: {
    fontSize: 12,
    color: colors.dark.subtext,
    fontFamily: 'monospace',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  goLiveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    borderRadius: 8,
  },
  goLiveButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  endButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dark.card,
    borderWidth: 1,
    borderColor: colors.dark.border,
    paddingVertical: 10,
    borderRadius: 8,
  },
  endButtonText: {
    color: colors.dark.text,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.dark.subtext,
    textAlign: 'center',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.dark.card,
    borderRadius: 16,
    padding: 24,
    width: '95%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.dark.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.dark.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.dark.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark.text,
    marginBottom: 8,
  },
  streamTypeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  streamTypeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.dark.background,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  streamTypeOptionActive: {
    backgroundColor: colors.dark.accent + '20',
    borderColor: colors.dark.accent,
  },
  streamTypeOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.dark.subtext,
  },
  streamTypeOptionTextActive: {
    color: colors.dark.accent,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: colors.dark.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark.accent,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: colors.dark.subtext,
    marginBottom: 4,
    lineHeight: 16,
  },
  streamKeyList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  streamKeyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.dark.background,
    borderWidth: 1,
    borderColor: colors.dark.border,
    marginBottom: 8,
  },
  streamKeyOptionActive: {
    backgroundColor: colors.dark.accent + '20',
    borderColor: colors.dark.accent,
  },
  streamKeyInfo: {
    flex: 1,
  },
  streamKeyName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.dark.text,
    marginBottom: 4,
  },
  streamKeyNameActive: {
    color: colors.dark.accent,
    fontWeight: '600',
  },
  streamKeyUsage: {
    fontSize: 12,
    color: colors.dark.subtext,
  },
  selectedIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.dark.accent,
  },
  noKeysText: {
    fontSize: 14,
    color: colors.dark.subtext,
    textAlign: 'center',
    paddingVertical: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.dark.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.dark.text,
    fontWeight: '500',
  },
  scheduleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.dark.accent,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  scheduleButtonText: {
    color: colors.dark.background,
    fontWeight: '600',
  },
  newKeySection: {
    marginBottom: 20,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.dark.accent,
    paddingVertical: 12,
    borderRadius: 8,
  },
  generateButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  streamKeysList: {
    maxHeight: 400,
    marginBottom: 20,
  },
  streamKeyCard: {
    backgroundColor: colors.dark.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  streamKeyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  streamKeyCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark.text,
  },
  streamKeyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  keyDeleteButton: {
    padding: 4,
  },
  streamKeyDetails: {
    gap: 12,
  },
  keyDetailRow: {
    gap: 6,
  },
  keyDetailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.dark.accent,
  },
  keyDetailValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  keyDetailText: {
    flex: 1,
    fontSize: 12,
    color: colors.dark.text,
    fontFamily: 'monospace',
  },
  keyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border,
  },
  keyStatsText: {
    fontSize: 11,
    color: colors.dark.subtext,
  },
  emptyKeys: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyKeysText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark.text,
    marginTop: 16,
  },
  emptyKeysSubtext: {
    fontSize: 14,
    color: colors.dark.subtext,
    marginTop: 4,
  },
  closeButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.dark.background,
    borderWidth: 1,
    borderColor: colors.dark.border,
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.dark.text,
    fontWeight: '500',
  },
});
