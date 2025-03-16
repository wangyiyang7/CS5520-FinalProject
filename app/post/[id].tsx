/**
* Displays detailed information for a specific community post, including content, category, 
* metrics, and interaction elements for guest and authenticated users.
*/

import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getPostById, PublicPost } from '@/Firebase/services/PostService';
import { CategoryBadge } from '@/components/public/PublicPostCard';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function PostDetailScreen() {
    const { id } = useLocalSearchParams();
    const [post, setPost] = useState<PublicPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const colorScheme = useColorScheme() ?? 'light';
    const router = useRouter();

    useEffect(() => {
        async function loadPost() {
            setLoading(true);
            try {
                const postId = Array.isArray(id) ? id[0] : id;
                if (!postId) {
                    setError('Post ID not found');
                    return;
                }

                const postData = await getPostById(postId);
                if (!postData) {
                    setError('Post not found');
                    return;
                }

                setPost(postData);
                setError(null);
            } catch (err) {
                console.error('Error loading post:', err);
                setError('Failed to load post');
            } finally {
                setLoading(false);
            }
        }

        loadPost();
    }, [id]);

    // Format date for display
    const formatDate = (date: Date): string => {
        return date.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator
                    size="large"
                    color={colorScheme === 'light' ? Colors.light.tint : Colors.dark.tint}
                />
            </View>
        );
    }

    if (error || !post) {
        return (
            <ThemedView style={styles.container}>
                <Stack.Screen options={{ title: 'Post Detail' }} />
                <ThemedText style={styles.errorText}>{error || 'Post not found'}</ThemedText>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ title: post.category || 'Post Detail' }} />

            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <CategoryBadge category={post.category} />
                    <ThemedText style={styles.date}>{formatDate(post.createdAt)}</ThemedText>
                </View>

                <ThemedText style={styles.title}>{post.title}</ThemedText>

                {post.photoURL && (
                    <Image
                        source={{ uri: post.photoURL }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                )}

                <ThemedText style={styles.content}>{post.content}</ThemedText>

                <View style={styles.locationContainer}>
                    <ThemedText style={styles.locationText}>📍 {post.location}</ThemedText>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <ThemedText style={styles.statLabel}>Likes</ThemedText>
                        <ThemedText style={styles.statValue}>{post.likes}</ThemedText>
                    </View>
                    <View style={styles.statItem}>
                        <ThemedText style={styles.statLabel}>Verified</ThemedText>
                        <ThemedText style={styles.statValue}>{post.verified}</ThemedText>
                    </View>
                </View>

                <View style={styles.actionsContainer}>
                    <TouchableOpacity style={styles.actionButton}>
                        <ThemedText style={styles.actionButtonText}>👍 Like</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <ThemedText style={styles.actionButtonText}>✅ Verify</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <ThemedText style={styles.actionButtonText}>📤 Share</ThemedText>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        textAlign: 'center',
        margin: 24,
        fontSize: 16,
    },
    backButton: {
        backgroundColor: '#f0f0f0',
        padding: 12,
        borderRadius: 8,
        alignSelf: 'center',
        marginTop: 16,
    },
    backButtonText: {
        fontWeight: '500',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    date: {
        fontSize: 12,
        color: '#8E8E93',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 16,
    },
    content: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 16,
    },
    locationContainer: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
    },
    locationText: {
        fontSize: 14,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 24,
        padding: 16,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    actionButton: {
        flex: 1,
        margin: 4,
        padding: 12,
        backgroundColor: '#e0e0e0',
        borderRadius: 8,
        alignItems: 'center',
    },
    actionButtonText: {
        fontWeight: '500',
    },
});