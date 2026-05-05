import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../src/theme/ThemeProvider';
import { StyledText, StyledView, StyledAppBar } from '../src/components/styled';
import api from './axiosInstance'; // Please adjust path as needed
import * as ImagePicker from 'react-native-image-picker';

type UserProfile = {
  name: string;
  mobile: string;
  email?: string;
  gender?: string;
  profile_photo?: string | null;
};

export default function ProfileScreen({ navigation }: any) {
  const { theme } = useTheme();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editableField, setEditableField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/user/profile');
        setProfile(data.user);
        console.log(data)
      } catch (e) {
        console.log('Profile fetch error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveField = async (field: keyof UserProfile, value: string) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
    setEditableField(null);

    try {
      await api.put('/user/profile', { [field]: value });
    } catch {
      Alert.alert('Error', 'Failed to save changes');
    }
  };

  const pickImage = async () => {
    ImagePicker.launchImageLibrary(
      { mediaType: 'photo', maxWidth: 1024, maxHeight: 1024, quality: 0.85 },
      async (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Image Picker Error', response.errorMessage || '');
          return;
        }
        if (response.assets && response.assets.length > 0) {
          const uri = response.assets[0].uri || '';
          if (!profile) return;
          setProfile({ ...profile, profile_photo: uri });
          try {
            await api.put('/user/profile', { profile_photo: uri });
          } catch {
            Alert.alert('Error', 'Failed to save image');
          }
        }
      }
    );
  };

  if (loading)
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: '#f37f21' }]}>
        <MaterialIcons name="hourglass-empty" size={40} color="#fff" />
      </SafeAreaView>
    );

  if (!profile)
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: '#f37f21' }]}>
        <StyledText variant="body" color="inverse">
          Failed to load profile
        </StyledText>
      </SafeAreaView>
    );

  const EditableRow = ({
    label,
    field,
    keyboardType = 'default',
  }: {
    label: string;
    field: keyof UserProfile;
    keyboardType?: any;
  }) => {
    const isEditing = editableField === field;
    return (
      <StyledView style={[styles.infoRow, { backgroundColor: '#f8f9fa' }]}>
        <StyledText variant="body" color="primary" style={{ width: 110, fontWeight: '700' }}>
          {label}
        </StyledText>
        {isEditing ? (
          <TextInput
            autoFocus
            style={[styles.textInput, { color: '#333' }]}
            value={tempValue}
            keyboardType={keyboardType}
            onChangeText={setTempValue}
            onBlur={() => saveField(field, tempValue.trim())}
            onSubmitEditing={() => saveField(field, tempValue.trim())}
            placeholder={`Enter your ${label.toLowerCase()}`}
            placeholderTextColor="#999"
          />
        ) : (
          <TouchableOpacity
            activeOpacity={0.6}
            style={{ flex: 1, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}
            onPress={() => {
              setEditableField(field);
              setTempValue(profile[field] ?? '');
            }}
          >
            <StyledText variant="body" color="primary" style={{ flexWrap: 'wrap', flex: 1 }}>
              {profile[field] || `Tap to add ${label.toLowerCase()}`}
            </StyledText>
            <MaterialIcons name="edit" size={18} color="#f37f21" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        )}
      </StyledView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StyledAppBar
        title="Profile & Settings"
        subtitle="Manage your account"
        showBackButton
        onBackPress={() => navigation.goBack()}
        style={{ backgroundColor: '#f37f21' }}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
            {profile.profile_photo ? (
              <Image source={{ uri: profile.profile_photo }} style={styles.profilePicture} />
            ) : (
              <View style={styles.defaultAvatar}>
                <MaterialIcons name="person-outline" size={80} color="#f37f21" />
              </View>
            )}
          </TouchableOpacity>
          <StyledText variant="h2" color="primary" style={styles.profileName}>
            {profile.name || 'Your Name'}
          </StyledText>
          <StyledText variant="body" color="primary" style={{ marginTop: 4, opacity: 0.7 }}>
            User
          </StyledText>
        </View>

        <View style={styles.infoContainer}>
          <EditableRow label="Name" field="name" />
          <EditableRow label="Mobile" field="mobile" keyboardType="phone-pad" />
          <EditableRow label="Email" field="email" keyboardType="email-address" />
          <EditableRow label="Gender" field="gender" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f37f21',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  profileCard: {
    backgroundColor: '#f8f9fa',
    margin: 16,
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    shadowColor: '#ff7f17',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 12,
  },
  defaultAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#f37f21',
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#f37f21',
  },
  profileName: {
    marginTop: 16,
    fontSize: 28,
    fontWeight: '900',
    color: '#333',
  },
  infoContainer: {
    marginHorizontal: 16,
    marginTop: 32,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
    shadowColor: '#00000050',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e2e2',
  },
  textInput: {
    flex: 1,
    fontSize: 17,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 6,
    color: '#333',
  },
});
