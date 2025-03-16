/**
 * Component that displays a list of public posts with integrated weather information.
 * Fixed to show multiple posts with weather fixed at top and proper background styling.
 */
import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, View, ActivityIndicator, RefreshControl, SafeAreaView, Button, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PublicPostCard } from './PublicPostCard';
import CompactWeather from '@/components/public/CompactWeather';
import { fetchPublicPosts, PublicPost } from '@/Firebase/services/PostService';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { initializeDatabase } from '../../Firebase/services/DatabaseService';

export function PublicPostsList() {
    const [posts, setPosts] = useState<PublicPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const colorScheme = useColorScheme() ?? 'light';

    const loadPosts = async () => {
        setLoading(true);
        try {
            const fetchedPosts = await fetchPublicPosts(10); // Fetch up to 10 posts
            console.log(`Fetched ${fetchedPosts.length} posts:`, JSON.stringify(fetchedPosts, null, 2));
            setPosts(fetchedPosts);
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadPosts();
        setRefreshing(false);
    };

    useEffect(() => {
        loadPosts();
    }, []);

    const handlePostPress = (post: PublicPost) => {
        console.log('Post pressed:', post.id);
    };

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
                {/* Fixed weather component at the top */}
                <View style={styles.weatherContainer}>
                    <CompactWeather />
                </View>

                <ThemedText type="subtitle" style={styles.sectionTitle}>
                    Recent Updates Nearby
                </ThemedText>

                {/* Debug info */}
                <ThemedText>Debug: Found {posts.length} posts</ThemedText>

                {posts.length === 0 ? (
                    <ThemedView style={styles.emptyContainer}>
                        <ThemedText style={styles.emptyText}>
                            No recent updates in your area.
                        </ThemedText>
                    </ThemedView>
                ) : (
                    <FlatList
                        data={posts}
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

            {/* <Button
                title="Initialize Test Data"
                onPress={() => {
                    initializeDatabase(true) // Force initialization 
                        .then(initialized => {
                            if (initialized) {
                                // If data was initialized, reload posts
                                loadPosts();
                            }
                            Alert.alert(
                                "Database Initialization",
                                initialized ? "Test data created successfully!" : "No initialization needed."
                            );
                        });
                }}
            /> */}

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F7F7F7', // Light background for the entire screen
    },
    container: {
        flex: 1,
        padding: 16,
    },
    weatherContainer: {
        marginBottom: 16,
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
    },
    emptyText: {
        textAlign: 'center',
        color: '#8E8E93',
    },
    listContent: {
        paddingBottom: 20,
    },
});