import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
  Switch,
  Alert,
} from 'react-native';

interface Movie {
  id: number;
  title: string;
  vote_average: number;
  release_date: string;
  poster_path: string | null;
  overview: string;
}

type SortOption = 'popularity' | 'title' | 'rating' | 'year';

export default function Movie() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('popularity');

  // sortBy'ya göre API parametrelerini eşle
  const getSortByParam = () => {
    switch (sortBy) {
      case 'popularity':
        return 'popularity.desc';
      case 'title':
        return 'original_title.asc';
      case 'rating':
        return 'vote_average.desc';
      case 'year':
        return 'release_date.desc';
      default:
        return 'popularity.desc';
    }
  };

  const fetchMovies = (pageNumber: number, sortCriteria: SortOption) => {
    setLoading(true);
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2Njc4NjY5MzJjNGUzNmM1YzlmNWQwYzRlOWUxMjhlMiIsIm5iZiI6MTc1MDQyMzQ1OS4zMjksInN1YiI6IjY4NTU1N2EzYTQ5Nzg3ODhjY2ZjMGFkOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.txegzLW8S7DPbJ5ehbmOVLb6BRYq1RRAyd8M7jSOxFM',
      },
    };

    const sortParam = getSortByParam();

    fetch(
      `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${pageNumber}&sort_by=${sortParam}`,
      options,
    )
      .then(res => res.json())
      .then(data => {
        if (data.results && data.results.length > 0) {
          if (pageNumber === 1) {
            setMovies(data.results);
          } else {
            setMovies(prev => [...prev, ...data.results]);
          }
          if (data.results.length < 10) {
            setHasMore(false);
          } else {
            setHasMore(true);
          }
        } else {
          setHasMore(false);
        }
      })
      .catch(err => {
        console.error(err);
        setHasMore(false);
      })
      .finally(() => setLoading(false));
  };

  // page veya sortBy değişince veriyi tekrar çek
  useEffect(() => {
    fetchMovies(page, sortBy);
  }, [page, sortBy]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const openModal = (movie: Movie) => {
    setSelectedMovie(movie);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: Movie }) => (
    <TouchableOpacity
      style={[styles.card, darkMode && styles.cardDark]}
      onPress={() => openModal(item)}>
      {item.poster_path ? (
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
          style={styles.image}
        />
      ) : (
        <View style={[styles.image, styles.noImage]}>
          <Text>No Image</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={[styles.title, darkMode && styles.textLight]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={darkMode && styles.textLight}>⭐ {item.vote_average}</Text>
        <Text style={darkMode && styles.textLight}>
          📅 {item.release_date ? item.release_date.substring(0, 4) : 'N/A'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Sıralama butonuna tıklayınca alert ile seçim yap
  const handleSortPress = () => {
    Alert.alert(
      'Sort movies by',
      '',
      [
        { text: 'Popularity (Default)', onPress: () => { setSortBy('popularity'); setPage(1); } },
        { text: 'Title (A-Z)', onPress: () => { setSortBy('title'); setPage(1); } },
        { text: 'Rating (High to Low)', onPress: () => { setSortBy('rating'); setPage(1); } },
        { text: 'Year (New to Old)', onPress: () => { setSortBy('year'); setPage(1); } },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true },
    );
  };

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.containerDark]}>
      {/* AppBar */}
      <View style={[styles.appBar, darkMode && styles.appBarDark]}>
        <Text style={[styles.appTitle, darkMode && styles.textLight]}>Movie App</Text>

        <View style={styles.appBarRight}>
          <TouchableOpacity onPress={handleSortPress} style={styles.sortButton}>
            <Text style={[styles.sortButtonText, darkMode && styles.textLight]}>Sort</Text>
          </TouchableOpacity>

          <View style={styles.switchContainer}>
            <Text style={[styles.switchLabel, darkMode && styles.textLight]}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={val => setDarkMode(val)}
              thumbColor={darkMode ? '#f4f3f4' : '#f4f3f4'}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
            />
          </View>
        </View>
      </View>

      {/* Film Listesi */}
      <FlatList
        data={movies}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          loading ? <ActivityIndicator size="large" color="#555" style={{ margin: 10 }} /> : null
        }
      />

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={[styles.modalOverlay, darkMode && styles.modalOverlayDark]}>
          <View style={[styles.modalContent, darkMode && styles.modalContentDark]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Pressable style={styles.modalClose} onPress={() => setModalVisible(false)}>
                <Text style={[{ fontSize: 24, fontWeight: 'bold' }, darkMode && styles.textLight]}>
                  ×
                </Text>
              </Pressable>
              {selectedMovie && (
                <>
                  {selectedMovie.poster_path && (
                    <Image
                      source={{ uri: `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}` }}
                      style={styles.modalImage}
                    />
                  )}
                  <Text style={[styles.modalTitle, darkMode && styles.textLight]}>
                    {selectedMovie.title}
                  </Text>
                  <Text style={[styles.modalInfo, darkMode && styles.textLight]}>
                    ⭐ Rating: {selectedMovie.vote_average} | 📅 Year:{' '}
                    {selectedMovie.release_date
                      ? selectedMovie.release_date.substring(0, 4)
                      : 'N/A'}
                  </Text>
                  <Text style={[styles.modalOverview, darkMode && styles.textLight]}>
                    {selectedMovie.overview}
                  </Text>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Genel container
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#121212',
  },

  // AppBar
  appBar: {
    height: 60,
    backgroundColor: '#6200ee',
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appBarDark: {
    backgroundColor: '#ss',
  },
  appTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  textLight: {
    color: '#fff',
  },

  appBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sortButton: {
    marginRight: 15,
    backgroundColor: '#03dac6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sortButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },

  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    marginRight: 6,
    color: '#000',
  },

  // Kartlar
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 10,
    width: '48%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  cardDark: {
    backgroundColor: '#1e1e1e',
  },
  image: {
    width: '100%',
    height: 180,
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ccc',
  },
  info: {
    padding: 8,
  },
  title: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
    color: '#000',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalOverlayDark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalContentDark: {
    backgroundColor: '#2c2c2c',
  },
  modalClose: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  modalImage: {
    width: '100%',
    height: 300,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginHorizontal: 15,
    marginTop: 15,
  },
  modalInfo: {
    marginHorizontal: 15,
    marginTop: 5,
    fontSize: 16,
    color: '#555',
  },
  modalOverview: {
    marginHorizontal: 15,
    marginTop: 15,
    fontSize: 15,
    lineHeight: 22,
  },
});
