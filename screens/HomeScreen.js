import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Alert, TextInput, Switch
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [folders, setFolders] = useState([]);
  const [songs, setSongs] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); 
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          const albums = await MediaLibrary.getAlbumsAsync();
          const audioFolders = await filterAudioContainingFolders(albums);
          setFolders(audioFolders);
        } else {
          Alert.alert('Permission denied', 'You need to grant media library permissions to use this app.');
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'There was an error fetching media from your library.');
      }
    })();
  }, []);

  const filterAudioContainingFolders = async (albums) => {
    const audioFolders = [];
    for (const album of albums) {
      const assets = await MediaLibrary.getAssetsAsync({ album: album.id, mediaType: 'audio' });
      if (assets.totalCount > 0) {
        audioFolders.push(album);
      }
    }
    return audioFolders;
  };

  const navigateToFolder = async (folder) => {
    try {
      const folderAssets = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        album: folder.id,
      });
      setSongs(folderAssets.assets);
      setCurrentFolder(folder);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'There was an error fetching songs from the folder.');
    }
  };

  const navigateToPlayback = (song) => {
    navigation.navigate('Playback', { song });
  };

  const renderItem = ({ item }) => {
    if (currentFolder) {
      return (
        <TouchableOpacity style={styles.songItem} onPress={() => navigateToPlayback(item)}>
          <Image source={{ uri: item.uri }} style={styles.albumArt} />
          <View style={styles.songInfo}>
            <Text style={styles.songTitle}>{item.filename}</Text>
            <Text style={styles.songArtist}>{item.artist || 'Unknown Artist'}</Text>
            <Text style={styles.songDuration}>{formatDuration(item.duration)}</Text>
          </View>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity style={styles.folderItem} onPress={() => navigateToFolder(item)}>
          <Text style={styles.folderName}>{item.title}</Text>
        </TouchableOpacity>
      );
    }
  };

  const formatDuration = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds};`
  };

  const goBack = () => {
    setCurrentFolder(null);
    setSongs([]);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (currentFolder) {
      const filteredSongs = songs.filter(song => song.filename.toLowerCase().includes(text.toLowerCase()));
      setSongs(filteredSongs);
    } else {
      const filteredFolders = folders.filter(folder => folder.title.toLowerCase().includes(text.toLowerCase()));
      setFolders(filteredFolders);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(previousState => !previousState);
  };

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      <View style={styles.header}>
        {currentFolder && (
          <TouchableOpacity onPress={goBack}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerText}>{currentFolder ? currentFolder.title : 'Music Player'}</Text>
        <Switch value={darkMode} onValueChange={toggleDarkMode} />
      </View>
      <TextInput
        style={styles.searchBar}
        placeholder="Search"
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <FlatList
        data={currentFolder ? songs : folders}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    padding: 10,
  },
  darkContainer: {
    backgroundColor: '#333',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backText: {
    fontSize: 18,
    color: '#4CAF50',
    marginRight: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  list: {
    flex: 1,
  },
  searchBar: {
    height: 40,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 50,
    paddingLeft: 10,
    marginBottom: 10,
  },
  folderItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  folderName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 20,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  albumArt: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginRight: 10,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  songArtist: {
    fontSize: 14,
    color: '#666',
  },
  songDuration: {
    fontSize: 12,
    color: '#999',
  },
});

export default HomeScreen;