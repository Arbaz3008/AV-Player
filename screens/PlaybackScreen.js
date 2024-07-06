import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, Alert , TextInput} from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import { Ionicons } from '@expo/vector-icons';

const PlaybackScreen = ({ route }) => {

  const initialSong = route?.params?.song || {
    filename: 'Unknown Song',
    artist: 'Unknown Artist',
    uri: '',
    duration: 0,
  };

  // Initialize state
  const [song, setSong] = useState({
    title: initialSong.filename,
    artist: initialSong.artist,
    artwork: initialSong.uri,
    duration: initialSong.duration ? initialSong.duration / 1000 : 0, // Convert milliseconds to seconds or default to 0
    currentTime: 0,
  });
  const [playbackStatus, setPlaybackStatus] = useState('paused');
  const [favorite, setFavorite] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [sound, setSound] = useState(null);
  const [queue, setQueue] = useState([initialSong]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
  const [offline, setOffline] = useState(false);
  const [sleepTimer, setSleepTimer] = useState(null);
  const [customTime, setCustomTime] = useState('');


  // Load and play the initial song
  useEffect(() => {
    if (initialSong.uri) {
      (async () => {
        try {
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: initialSong.uri },
            { shouldPlay: true },
            (status) => {
              setSong((prevSong) => ({
                ...prevSong,
                currentTime: status.positionMillis / 1000,
                duration: status.durationMillis ? status.durationMillis / 1000 : prevSong.duration,
              }));
              setPlaybackStatus(status.isPlaying ? 'playing' : 'paused');
            }
          );
          setSound(newSound);
        } catch (error) {
          console.error('Error loading song:', error);
          Alert.alert('Error', 'There was an error loading the song.');
        }
      })();
    }

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [initialSong.uri]);

  // Update current time every second if playing
  useEffect(() => {
    let intervalId;
    if (playbackStatus === 'playing') {
      intervalId = setInterval(() => {
        setSong((prevSong) => ({
          ...prevSong,
          currentTime: prevSong.currentTime + 1,
        }));
      }, 1000);
    } else {
      clearInterval(intervalId);
    }
    return () => clearInterval(intervalId);
  }, [playbackStatus]);

  // Handle play/pause toggle
  const handlePlayPause = () => {
    if (sound) {
      if (playbackStatus === 'paused') {
        sound.playAsync();
      } else {
        sound.pauseAsync();
      }
      setPlaybackStatus((prevStatus) => (prevStatus === 'paused' ? 'playing' : 'paused'));
    }
  };

  // Handle next song in queue
  const handleNext = () => {
    if (shuffle) {
      const nextIndex = Math.floor(Math.random() * queue.length);
      setCurrentQueueIndex(nextIndex);
    } else {
      setCurrentQueueIndex((prevIndex) => (prevIndex + 1) % queue.length);
    }
    playSong(queue[currentQueueIndex]);
  };

  // Handle previous song in queue
  const handlePrevious = () => {
    setCurrentQueueIndex((prevIndex) => (prevIndex - 1 + queue.length) % queue.length);
    playSong(queue[currentQueueIndex]);
  };

  // Play selected song
  const playSong = async (song) => {
    if (sound) {
      await sound.unloadAsync();
    }
    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: song.uri },
      { shouldPlay: true }
    );
    setSound(newSound);
    setSong({
      title: song.filename,
      artist: song.artist || 'Unknown Artist',
      artwork: song.uri,
      duration: song.duration ? song.duration / 1000 : 0,
      currentTime: 0,
    });
    setPlaybackStatus('playing');
  };

  // Handle favorite toggle
  const handleFavorite = () => {
    setFavorite((prevFavorite) => !prevFavorite);
  };

  // Handle repeat toggle
  const handleRepeat = () => {
    setRepeat((prevRepeat) => !prevRepeat);
  };

  // Handle shuffle toggle
  const handleShuffle = () => {
    setShuffle((prevShuffle) => !prevShuffle);
  };

  const handleCustomTimeChange = (text) => {
    setCustomTime(text);
  };
  
  const handleCustomTimeSubmit = () => {
    const time = parseInt(customTime);
    if (time > 0) {
      handleSleepTimer(time);
    }
  };
  

  // Handle download for offline
  const handleDownloadOffline = () => {
    setOffline((prevOffline) => !prevOffline);
    // Implement download functionality here
  };

  // Format time in minutes and seconds
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <MenuProvider>
      <View style={styles.container}>
        <View style={styles.nowPlayingSection}>
          {song.artwork ? (
            <Image source={{ uri: song.artwork }} style={styles.artwork} />
          ) : (
            <View style={styles.artworkPlaceholder} />
          )}
          <View style={styles.songDetails}>
            <Text style={styles.title}>{song.title}</Text>
            <Text style={styles.artist}>{song.artist}</Text>
          </View>
        </View>
        <View style={styles.progressBar}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={song.duration || 1} // Ensure maximumValue is never NaN
            value={song.currentTime}
            onValueChange={(value) => {
              if (sound) {
                sound.setPositionAsync(value * 1000);
              }
              setSong({ ...song, currentTime: value });
            }}
            minimumTrackTintColor="#4CAF50"
            maximumTrackTintColor="#DDD"
            thumbTintColor="#4CAF50"
          />
          <View style={styles.timeLabels}>
            <Text>{formatTime(song.currentTime)}</Text>
            <Text>{formatTime(song.duration)}</Text>
          </View>
        </View>
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={handlePrevious}>
            <Text>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={handlePlayPause}>
            <Text>{playbackStatus === 'paused' ? 'Play' : 'Pause'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={handleNext}>
            <Text>Next</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.menuBar}>
          <Menu>
            <MenuTrigger>
              <Ionicons name="menu" size={32} color="black" />
            </MenuTrigger>
            <MenuOptions>
              <MenuOption onSelect={handleFavorite}>
                <Text style={styles.menuOptionText}>{favorite ? 'Unfavorite' : 'Favorite'}</Text>
              </MenuOption>
              <MenuOption onSelect={() => console.log('Lyrics not implemented yet')}>
                <Text style={styles.menuOptionText}>Lyrics</Text>
              </MenuOption>
              <MenuOption onSelect={handleRepeat}>
                <Text style={styles.menuOptionText}>{repeat ? 'Repeat Off' : 'Repeat On'}</Text>
              </MenuOption>
              <MenuOption onSelect={handleShuffle}>
                <Text style={styles.menuOptionText}>{shuffle ? 'Shuffle Off' : 'Shuffle On'}</Text>
              </MenuOption>
              <MenuOption onSelect={handleDownloadOffline}>
                <Text style={styles.menuOptionText}>{offline ? 'Remove Download' : 'Download'}</Text>
              </MenuOption>
              <MenuOptions>
    <MenuOption onSelect={() => handleSleepTimer(30)}>
      <Text>30 minutes</Text>
    </MenuOption>
    <MenuOption onSelect={() => handleSleepTimer(60)}>
      <Text>1 hour</Text>
    </MenuOption>
    <MenuOption>
      <TextInput
        style={styles.textInput}
        placeholder="Enter custom time"
        value={customTime}
        onChangeText={handleCustomTimeChange}
        onSubmitEditing={handleCustomTimeSubmit}
      />
    </MenuOption>
    </MenuOptions>
            </MenuOptions>
          </Menu>
        </View>
        <View style={styles.queue}>
          <FlatList
            data={queue}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => playSong(item)}>
                <Text style={styles.queueItem}>
                  {index + 1}. {item.filename}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </MenuProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    padding: 20,
    justifyContent: 'center',
  },
  nowPlayingSection: {
    alignItems: 'center',
  },
  artwork: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  artworkPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#DDD',
    marginBottom: 20,
  },
  songDetails: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  artist: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  progressBar: {
    marginVertical: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  controlButton: {
    //backgroundColor: '#4CAF50',
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 20,
  },
  menuBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  menuOptionText: {
    fontSize: 16,
    padding: 10,
  },
  queue: {
    marginTop: 20,
  },
  queueItem: {
    fontSize: 18,
    padding: 10,
    backgroundColor: '#EEE',
    marginVertical: 5,
    textAlign: 'center',
  },
});

export default PlaybackScreen;
