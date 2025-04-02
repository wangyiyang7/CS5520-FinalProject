/**
 * Interactive map view that displays all posts as markers based on their locations.
 * Allows users to explore posts geographically with a preview panel for selected posts.
 */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Dimensions
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { fetchPublicPosts, PublicPost } from "@/Firebase/services/PostService";
import { useRouter, useFocusEffect } from "expo-router";
import { Colors } from "@/constants/Colors";
import { MapController } from '@/components/MapController';
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const [posts, setPosts] = useState<PublicPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PublicPost | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const router = useRouter();

  // Animation for the detail panel
  const panelHeight = useMemo(() => new Animated.Value(0), []);

  // Load posts function (moved outside useEffect for reusability)
  const loadPosts = async () => {
    setLoading(true);
    try {
      const fetchedPosts = await fetchPublicPosts(50);
      const postsWithLocation = fetchedPosts.filter(post =>
        post.location && post.location.latitude && post.location.longitude
      );
      setPosts(postsWithLocation);

      if (postsWithLocation.length > 0) {
        const uniqueCategories = Array.from(
          new Set(postsWithLocation.map(post => post.category))
        );
        setSelectedCategories(uniqueCategories);
      }
    } catch (error) {
      console.error("Error loading posts for map:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Manual refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
  };

  // Load posts when component mounts
  useEffect(() => {
    loadPosts();
  }, []);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Map screen focused - refreshing posts');
      loadPosts();
      return () => {
        console.log('Map screen unfocused');
      };
    }, [])
  );

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(posts.map(post => post.category)));
  }, [posts]);

  // Filter posts based on selected categories
  const filteredPosts = useMemo(() => {
    if (selectedCategories.length === 0) return [];
    return posts.filter(post => selectedCategories.includes(post.category));
  }, [posts, selectedCategories]);

  // Get marker color based on category
  const getMarkerColor = (category: string): string => {
    const colors: Record<string, string> = {
      'Traffic': '#FF9500',
      'Safety': '#FF2D55',
      'Event': '#007AFF',
      'Infrastructure': '#34C759',
      'General': '#AF52DE',
      'Entertainment & Culture': '#007AFF',
      'Sports & Activities': '#34C759',
      'News & Incidents': '#FF2D55',
      'Food & Social': '#AF52DE',
      'Travel & Environment': '#5AC8FA',
    };

    return colors[category] || '#8E8E93';
  };

  // Handle marker press - show post details panel
  const handleMarkerPress = (post: PublicPost) => {
    setSelectedPost(post);

    // Animate the panel up
    Animated.spring(panelHeight, {
      toValue: 150,
      useNativeDriver: false,
      friction: 8
    }).start();
  };

  // Hide the panel
  const hidePanel = () => {
    Animated.timing(panelHeight, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false
    }).start(() => setSelectedPost(null));
  };

  // Navigate to full post details
  const viewFullPost = () => {
    if (selectedPost) {
      router.push({
        pathname: "/post/[id]",
        params: { id: selectedPost.id }
      });
    }
  };

  // Category filter handlers
  const handleSelectCategory = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedCategories(categories);
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: filteredPosts.length > 0 ? filteredPosts[0].location.latitude : 37.78825,
          longitude: filteredPosts.length > 0 ? filteredPosts[0].location.longitude : -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {filteredPosts.map(post => (
          <Marker
            key={post.id}
            coordinate={{
              latitude: post.location.latitude,
              longitude: post.location.longitude
            }}
            pinColor={getMarkerColor(post.category)}
            onPress={() => handleMarkerPress(post)}
          />
        ))}
      </MapView>

      {/* Post count indicator */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'} on map
        </Text>
      </View>

      {/* Category filters with Refresh Button */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={Colors.light.tint} />
          ) : (
            <Ionicons name="refresh" size={22} color={Colors.light.tint} />
          )}
        </TouchableOpacity>

        <View style={styles.controllerWrapper}>
          <MapController
            categories={categories}
            selectedCategories={selectedCategories}
            onSelectCategory={handleSelectCategory}
            onSelectAll={handleSelectAll}
            onClearAll={handleClearAll}
          />
        </View>
      </View>

      {/* Post detail panel */}
      <Animated.View style={[
        styles.detailPanel,
        { height: panelHeight }
      ]}>
        {selectedPost && (
          <View style={styles.panelContent}>
            <TouchableOpacity style={styles.closeButton} onPress={hidePanel}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>

            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle} numberOfLines={1}>
                {selectedPost.title}
              </Text>
              <View style={[
                styles.categoryBadge,
                { backgroundColor: getMarkerColor(selectedPost.category) }
              ]}>
                <Text style={styles.categoryText}>{selectedPost.category}</Text>
              </View>
            </View>

            <Text style={styles.panelDescription} numberOfLines={2}>
              {selectedPost.content}
            </Text>

            <View style={styles.panelFooter}>
              <Text style={styles.panelLocation}>
                📍 {selectedPost.locationName}
              </Text>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={viewFullPost}
              >
                <Text style={styles.viewButtonText}>View Full Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  countContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  countText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  // New styles for refresh control
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
  },
  controllerWrapper: {
    flex: 1,
  },
  refreshButton: {
    padding: 8,
    marginLeft: 8,
    marginRight: 4,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 38,
    height: 38,
  },
  // Detail panel styles
  detailPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
    overflow: 'hidden'
  },
  panelContent: {
    padding: 15,
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 10,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingRight: 30, // Space for close button
  },
  panelTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
    marginRight: 10,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  panelDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  panelFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  panelLocation: {
    fontSize: 12,
    color: '#666',
  },
  viewButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  viewButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 12,
  },
});