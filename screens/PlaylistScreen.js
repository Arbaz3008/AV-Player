import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import * as MediaLibrary from 'expo-media-library';

const PlaylistScreen = () => {
  const [playlist, setPlaylist] = useState([]);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          setPermissionGranted(true);
          const media = await MediaLibrary.getAssetsAsync({
            mediaType: MediaLibrary.MediaType.audio,
            first: 1000,  // Adjust this number based on your needs
          });
          const songs = media.assets.map(asset => ({
            id: asset.id,
            title: asset.filename,
            artist: asset.albumId,  // MediaLibrary does not provide artist name, so using albumId as a placeholder
            duration: formatDuration(asset.duration),
          }));
          setPlaylist(songs);
        } else {
          Alert.alert('Permission denied', 'You need to grant media library permissions to use this app.');
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'There was an error fetching media from your library.');
      }
    };

    fetchSongs();
  }, []);

  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleDeleteSong = (id) => {
    const updatedPlaylist = playlist.filter((song) => song.id !== id);
    setPlaylist(updatedPlaylist);
  };

  const renderItem = ({ item }) => (
    <View style={styles.songItem}>
      <View style={styles.songInfo}>
        <Text style={styles.songTitle}>{item.title}</Text>
        <Text style={styles.songArtist}>{item.artist}</Text>
        <Text style={styles.songDuration}>{item.duration}</Text>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteSong(item.id)}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  if (!permissionGranted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Requesting permission to access media library...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Playlist</Text>
      <FlatList
        data={playlist}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.playlist}
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
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  permissionText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  playlist: {
    flex: 1,
  },
  songItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  songArtist: {
    fontSize: 16,
    color: '#666',
  },
  songDuration: {
    fontSize: 14,
    color: '#999',
  },
  deleteButton: {
    backgroundColor: '#FF5733',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
  },
});

export default PlaylistScreen;
