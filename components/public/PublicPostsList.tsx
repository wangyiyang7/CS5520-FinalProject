/**
 * Component that displays a list of public posts with integrated weather information.
 * Fixed to show multiple posts with weather fixed at top and proper background styling.
 */
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { FlatList, StyleSheet, View, ActivityIndicator, RefreshControl, SafeAreaView, Button, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PublicPostCard } from './PublicPostCard';
import CompactWeather from '@/components/public/CompactWeather';
import { fetchPublicPosts, PublicPost } from '@/Firebase/services/PostService';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { initializeDatabase } from '../../Firebase/services/DatabaseService';
import { AuthContext } from '@/components/AuthContext';
import { PostFilters, FilterState } from '@/components/public/PostFilters';
import { calculateDistance, getCurrentLocation } from '@/utils/calculateDistance';

import { useFocusEffect, useRouter } from "expo-router";
import { getUserProfile, UserProfile } from '@/Firebase/services/UserService';

export function PublicPostsList() {
    const [posts, setPosts] = useState<PublicPost[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<PublicPost[]>([]);
    const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
    const [userRadius, setUserRadius] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const colorScheme = useColorScheme() ?? 'light';
    const { currentUser } = useContext(AuthContext);
    const router = useRouter();

    // Initialize filter state
    const [filterState, setFilterState] = useState<FilterState>({
        searchText: '',
        selectedCategories: [],
        radius: userRadius || 0,
        sortBy: 'newest'
    });

    // Load user location
    useEffect(() => {

        // console.log('Loading user===', currentUser);

        const getLocation = async () => {
            try {

                if (currentUser?.uid) {
                    try {
                        const info = await getUserProfile(currentUser.uid);
                        setUserRadius(info?.notificationPreferences.radius || 0);
                        console.log('User info:', info?.notificationPreferences.radius);
                        setUserInfo(info);
                    } catch (e) {
                        console.error("Failed to fetch user profile:", e);
                    }
                }



                const location = await getCurrentLocation();
                if (location?.coords) {
                    setUserLocation({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude
                    });
                }
            } catch (error) {
                console.error('Error getting location:', error);
            }
        };

        getLocation();
    }, []);

    // Load posts from the API
    const loadPosts = async () => {
        setLoading(true);
        try {
            // Fetch posts with the current radius filter
            // console.error('fetching.....:', filterState.radius);
            // console.error('user raduis is.....:', userRadius);

            // const fetchedPosts = await fetchPublicPosts(20, userRadius ? userRadius : filterState.radius);

            // // Extract unique categories from posts
            // const categories = Array.from(new Set(fetchedPosts.map(post => post.category)));
            // setAvailableCategories(categories);

            // // Store all posts
            // setPosts(fetchedPosts);

            // // Apply client-side filters
            // applyFilters(fetchedPosts);



            // Determine which radius to use
            // If user is logged in and has a radius preference, use that
            // Otherwise use the filter state radius 
            // If both are 0, fetch all posts without distance filtering
            const effectiveRadius = 0 //userRadius > 0 ? userRadius : filterState.radius;

            console.log(`Loading posts with radius: ${effectiveRadius}km`);
            console.log(`User radius: ${userRadius}km, Filter radius: ${filterState.radius}km`);

            const fetchedPosts = await fetchPublicPosts(50, effectiveRadius);

            // Extract unique categories from posts
            const categories = Array.from(new Set(fetchedPosts.map(post => post.category)));
            setAvailableCategories(categories);

            // Store all posts
            setPosts(fetchedPosts);

            // Apply client-side filters (excluding radius since it's already applied by fetchPublicPosts)
            applyFilters(fetchedPosts);

            console.log(`Loaded ${fetchedPosts.length} posts with ${categories.length} categories`);


        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            setLoading(false);
        }
    };

    // Apply filters to the fetched posts
    const applyFilters_ = useCallback((postsToFilter = posts) => {
        let result = [...postsToFilter];

        // Apply search text filter
        if (filterState.searchText) {
            const searchLower = filterState.searchText.toLowerCase();
            result = result.filter(post =>
                post.title.toLowerCase().includes(searchLower) ||
                post.content.toLowerCase().includes(searchLower) ||
                post.locationName.toLowerCase().includes(searchLower) ||
                post.category.toLowerCase().includes(searchLower)
            );
        }

        // Apply category filter
        if (filterState.selectedCategories.length > 0) {
            result = result.filter(post =>
                filterState.selectedCategories.includes(post.category)
            );
        }

        // Apply sorting
        switch (filterState.sortBy) {
            case 'newest':
                result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case 'oldest':
                result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                break;
            case 'popular':
                result.sort((a, b) => (b.likes + b.verified) - (a.likes + a.verified));
                break;
            case 'proximity':
                if (userLocation) {
                    result.sort((a, b) => {
                        const distanceA = calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            a.location.latitude,
                            a.location.longitude
                        );
                        const distanceB = calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            b.location.latitude,
                            b.location.longitude
                        );
                        return distanceA - distanceB;
                    });
                }
                break;
        }

        setFilteredPosts(result);
    }, [filterState, posts, userLocation]);



    // In PublicPostsList.tsx, modify the applyFilters function:

    const applyFilters_o = useCallback((postsToFilter = posts) => {
        let result = [...postsToFilter];

        // Apply search text filter
        if (filterState.searchText) {
            const searchLower = filterState.searchText.toLowerCase();
            result = result.filter(post =>
                post.title.toLowerCase().includes(searchLower) ||
                post.content.toLowerCase().includes(searchLower) ||
                post.locationName.toLowerCase().includes(searchLower) ||
                post.category.toLowerCase().includes(searchLower)
            );
        }

        // Apply category filter
        if (filterState.selectedCategories.length > 0) {
            result = result.filter(post =>
                filterState.selectedCategories.includes(post.category)
            );
        }

        // Check if we should apply radius filter
        let filteredByRadius = [];
        if (userLocation) {
            filteredByRadius = result.filter(post => {
                if (!post.location || !post.location.latitude || !post.location.longitude) {
                    return false;
                }

                const distance = calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    post.location.latitude,
                    post.location.longitude
                );

                return distance <= filterState.radius;
            });

            // Only apply radius filter if it doesn't filter out all posts
            if (filteredByRadius.length > 0) {
                result = filteredByRadius;
            } else {
                console.log('Radius filter would remove all posts, ignoring radius constraint');
            }
        }

        // Apply sorting
        switch (filterState.sortBy) {
            case 'newest':
                result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case 'oldest':
                result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                break;
            case 'popular':
                result.sort((a, b) => (b.likes + b.verified) - (a.likes + a.verified));
                break;
            case 'proximity':
                if (userLocation) {
                    result.sort((a, b) => {
                        if (!a.location || !a.location.latitude || !a.location.longitude) return 1;
                        if (!b.location || !b.location.latitude || !b.location.longitude) return -1;

                        const distanceA = calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            a.location.latitude,
                            a.location.longitude
                        );
                        const distanceB = calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            b.location.latitude,
                            b.location.longitude
                        );
                        return distanceA - distanceB;
                    });
                }
                break;
        }

        setFilteredPosts(result);
    }, [filterState, posts, userLocation]);


    // Update the applyFilters function to not re-apply radius filtering:

    const applyFilters = useCallback((postsToFilter = posts) => {
        let result = [...postsToFilter];

        // Apply search text filter
        if (filterState.searchText) {
            const searchLower = filterState.searchText.toLowerCase();
            result = result.filter(post =>
                post.title.toLowerCase().includes(searchLower) ||
                post.content.toLowerCase().includes(searchLower) ||
                post.locationName.toLowerCase().includes(searchLower) ||
                post.category.toLowerCase().includes(searchLower)
            );
        }

        // Apply category filter
        if (filterState.selectedCategories.length > 0) {
            result = result.filter(post =>
                filterState.selectedCategories.includes(post.category)
            );
        }

        // Note: We're no longer applying radius filtering here since it's done by fetchPublicPosts

        // Apply sorting
        switch (filterState.sortBy) {
            case 'newest':
                result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case 'oldest':
                result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                break;
            case 'popular':
                result.sort((a, b) => (b.likes + b.verified) - (a.likes + a.verified));
                break;
            case 'proximity':
                if (userLocation) {
                    result.sort((a, b) => {
                        if (!a.location || !a.location.latitude || !a.location.longitude) return 1;
                        if (!b.location || !b.location.latitude || !b.location.longitude) return -1;

                        const distanceA = calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            a.location.latitude,
                            a.location.longitude
                        );
                        const distanceB = calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            b.location.latitude,
                            b.location.longitude
                        );
                        return distanceA - distanceB;
                    });
                }
                break;
        }

        setFilteredPosts(result);
    }, [filterState, posts, userLocation]);




    // Handle refreshing the post list
    const handleRefresh = async () => {
        setRefreshing(true);
        await loadPosts();
        setRefreshing(false);
    };

    // Apply filters whenever filter state changes
    useEffect(() => {
        applyFilters();
    }, [filterState, applyFilters]);

    // Load posts when component mounts
    useEffect(() => {
        loadPosts();
    }, []);

    // Reload when filter radius changes or when component comes into focus
    useEffect(() => {
        // This effect is triggered whenever the radius changes
        // We need to reload posts from API with the new radius
        loadPosts();
    }, [filterState.radius]);

    useFocusEffect(
        useCallback(() => {
            console.log('Home screen focused - refreshing posts');
            loadPosts();
            return () => {
                console.log('Home screen unfocused');
            };
        }, [])
    );

    // Navigate to post detail
    const handlePostPress = (post: PublicPost) => {
        console.log('Post pressed:', post.id);
        router.push({
            pathname: "/post/[id]",
            params: { id: post.id }
        });
    };

    // Main render content
    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator
                    size="large"
                    color={colorScheme === 'light' ? Colors.light.tint : Colors.dark.tint}
                />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ThemedView style={styles.container}>
                {/* Weather component */}
                <View style={styles.weatherContainer}>
                    <CompactWeather />
                </View>

                {/* Filter component */}
                <View style={styles.filterContainer}>
                    <PostFilters
                        filterState={filterState}
                        setFilterState={setFilterState}
                        availableCategories={availableCategories}
                        onApplyFilters={() => loadPosts()}
                    />
                </View>

                <ThemedText type="subtitle" style={styles.sectionTitle}>
                    Recent Updates Nearby
                </ThemedText>

                {/* Post list */}
                {filteredPosts.length === 0 ? (
                    <ThemedView style={styles.emptyContainer}>
                        <ThemedText style={styles.emptyText}>
                            No posts match your current filters.
                        </ThemedText>
                    </ThemedView>
                ) : (
                    <FlatList
                        data={filteredPosts}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <PublicPostCard post={item} onPress={handlePostPress} />
                        )}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                tintColor={colorScheme === 'light' ? Colors.light.tint : Colors.dark.tint}
                            />
                        }
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                    />
                )}
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F7F7F7',
    },
    container: {
        flex: 1,
        padding: 16,
    },
    weatherContainer: {
        marginBottom: 16,
    },
    filterContainer: {
        marginBottom: 8,
    },
    sectionTitle: {
        marginBottom: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
    },
    emptyText: {
        textAlign: 'center',
        color: '#8E8E93',
    },
    listContent: {
        paddingBottom: 20,
    },
});