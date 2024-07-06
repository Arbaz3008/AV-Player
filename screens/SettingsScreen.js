import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Button, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';

const SettingsScreen = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRepeatEnabled, setIsRepeatEnabled] = useState(false);
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [language, setLanguage] = useState('en');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [socialMedia, setSocialMedia] = useState('');
  const [equalizer, setEqualizer] = useState({ bass: 50, mid: 50, treble: 50 });

  useEffect(() => {
    const loadSettings = async () => {
      const darkMode = await AsyncStorage.getItem('isDarkMode');
      if (darkMode !== null) setIsDarkMode(JSON.parse(darkMode));
      const repeatEnabled = await AsyncStorage.getItem('isRepeatEnabled');
      if (repeatEnabled !== null) setIsRepeatEnabled(JSON.parse(repeatEnabled));
      const shuffleEnabled = await AsyncStorage.getItem('isShuffleEnabled');
      if (shuffleEnabled !== null) setIsShuffleEnabled(JSON.parse(shuffleEnabled));
      const savedFontSize = await AsyncStorage.getItem('fontSize');
      if (savedFontSize !== null) setFontSize(JSON.parse(savedFontSize));
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage !== null) setLanguage(savedLanguage);
      const savedNotifications = await AsyncStorage.getItem('notificationsEnabled');
      if (savedNotifications !== null) setNotificationsEnabled(JSON.parse(savedNotifications));
      const savedFeedback = await AsyncStorage.getItem('feedback');
      if (savedFeedback !== null) setFeedback(savedFeedback);
      const savedSocialMedia = await AsyncStorage.getItem('socialMedia');
      if (savedSocialMedia !== null) setSocialMedia(savedSocialMedia);
      const savedEqualizer = await AsyncStorage.getItem('equalizer');
      if (savedEqualizer !== null) setEqualizer(JSON.parse(savedEqualizer));
    };
    loadSettings();
  }, []);

  const toggleSetting = async (key, value, setter) => {
    setter(value);
    await AsyncStorage.setItem(key, JSON.stringify(value));
  };

  const handleFeedbackChange = async (text) => {
    setFeedback(text);
    await AsyncStorage.setItem('feedback', text);
  };

  const handleSocialMediaChange = async (text) => {
    setSocialMedia(text);
    await AsyncStorage.setItem('socialMedia', text);
  };

  const handleEqualizerChange = async (key, value) => {
    const newEqualizer = { ...equalizer, [key]: value };
    setEqualizer(newEqualizer);
    await AsyncStorage.setItem('equalizer', JSON.stringify(newEqualizer));
  };

  const clearCache = async () => {
    // Implement cache clearing logic
    alert('Cache cleared!');
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.header, { fontSize }]}>Settings</Text>

      <View style={styles.option}>
        <Text>Theme</Text>
        <Switch
          value={isDarkMode}
          onValueChange={value => toggleSetting('isDarkMode', value, setIsDarkMode)}
        />
      </View>

      <View style={styles.option}>
        <Text>Repeat</Text>
        <Switch
          value={isRepeatEnabled}
          onValueChange={value => toggleSetting('isRepeatEnabled', value, setIsRepeatEnabled)}
        />
      </View>

      <View style={styles.option}>
        <Text>Shuffle</Text>
        <Switch
          value={isShuffleEnabled}
          onValueChange={value => toggleSetting('isShuffleEnabled', value, setIsShuffleEnabled)}
        />
      </View>

      <View style={styles.option}>
        <Text>Font Size</Text>
        <Slider
          value={fontSize}
          onValueChange={value => toggleSetting('fontSize', value, setFontSize)}
          minimumValue={10}
          maximumValue={24}
        />
      </View>

      <View style={styles.option}>
        <Text>Language</Text>
        <Picker
          selectedValue={language}
          style={{ height: 50, width: 150 }}
          onValueChange={(itemValue) => toggleSetting('language', itemValue, setLanguage)}>
          <Picker.Item label="English" value="en" />
          <Picker.Item label="Spanish" value="es" />
          {/* Add more languages */}
        </Picker>
      </View>

      <View style={styles.option}>
        <Text>Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={value => toggleSetting('notificationsEnabled', value, setNotificationsEnabled)}
        />
      </View>

      <View style={styles.option}>
        <Text>Feedback</Text>
        <TextInput
          style={styles.input}
          value={feedback}
          onChangeText={handleFeedbackChange}
          placeholder="Enter your feedback"
        />
      </View>

      <View style={styles.option}>
        <Text>Social Media</Text>
        <TextInput
          style={styles.input}
          value={socialMedia}
          onChangeText={handleSocialMediaChange}
          placeholder="Social media link"
        />
      </View>

      <View style={styles.option}>
        <Text>Equalizer</Text>
        <View style={styles.equalizer}>
          <Text>Bass</Text>
          <Slider
            value={equalizer.bass}
            onValueChange={value => handleEqualizerChange('bass', value)}
            minimumValue={0}
            maximumValue={100}
          />
          <Text>Mid</Text>
          <Slider
            value={equalizer.mid}
            onValueChange={value => handleEqualizerChange('mid', value)}
            minimumValue={0}
            maximumValue={100}
          />
          <Text>Treble</Text>
          <Slider
            value={equalizer.treble}
            onValueChange={value => handleEqualizerChange('treble', value)}
            minimumValue={0}
            maximumValue={100}
          />
        </View>
      </View>

      <View style={styles.option}>
        <Button title="Clear Cache" onPress={clearCache} />
      </View>

      {/* Add more options for feedback, social media integration, equalizer, etc. */}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  input: {
    height: 35,
    borderColor: 'gray',
    borderWidth:1,
    flex: 1,
    paddingHorizontal: 10,
    borderRadius: 50,
  },
  equalizer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
});

export default SettingsScreen;