/**
 * Displays post detail screen with author-specific actions (edit, delete) and 
 * interactive features for all users (like, verify, share).
 */

import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, View, Image, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Share } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getPostById, PublicPost, likePost, verifyPost, deletePost } from '@/Firebase/services/PostService';
import { CategoryBadge } from '@/components/public/PublicPostCard';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthContext } from '@/components/AuthContext';

import { Ionicons } from '@expo/vector-icons';

export default function PostDetailScreen() {
    const { id } = useLocalSearchParams();
    const [post, setPost] = useState<PublicPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [liked, setLiked] = useState(false);
    const [verified, setVerified] = useState(false);
    const colorScheme = useColorScheme() ?? 'light';
    const router = useRouter();
    const { currentUser } = useContext(AuthContext);

    // Check if current user is the author of the post
    const isAuthor = currentUser && post?.authorId === currentUser.uid;

    useEffect(() => {
        console.log('currentUser: ', currentUser && currentUser.uid);
        console.log('post?.authorId: ', post?.authorId);
        console.log('post?: ', post);

        loadPost();
    }, [id, post?.authorId]);

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

    // Handle Like Post
    const handleLike = async () => {
        if (!post) return;

        try {
            const success = await likePost(post.id);
            if (success) {
                setPost({
                    ...post,
                    likes: post.likes + 1
                });
                setLiked(true);
            }
        } catch (error) {
            console.error('Error liking post:', error);
            Alert.alert('Error', 'Failed to like post');
        }
    };

    // Handle Verify Post
    const handleVerify = async () => {
        if (!post) return;

        try {
            const success = await verifyPost(post.id);
            if (success) {
                setPost({
                    ...post,
                    verified: post.verified + 1
                });
                setVerified(true);
            }
        } catch (error) {
            console.error('Error verifying post:', error);
            Alert.alert('Error', 'Failed to verify post');
        }
    };

    // Handle Share Post
    const handleShare = async () => {
        if (!post) return;

        try {
            await Share.share({
                message: `Check out this post on Local Buzz: ${post.title}\n\n${post.content}\n\nLocation: ${post.locationName}`,
                title: post.title,
            });
        } catch (error) {
            console.error('Error sharing post:', error);
        }
    };

    // Handle Edit Post
    const handleEdit = () => {
        if (!post) return;

        router.push({
            pathname: "/post/edit/[id]",
            params: { id: post.id }
        });
    };

    // Handle Delete Post
    const handleDelete = async () => {
        if (!post) return;

        Alert.alert(
            "Delete Post",
            "Are you sure you want to delete this post? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const success = await deletePost(post.id);
                            if (success) {
                                Alert.alert("Success", "Post deleted successfully");
                                router.replace("/(tabs)");
                            } else {
                                Alert.alert("Error", "Failed to delete post");
                            }
                        } catch (error) {
                            console.error('Error deleting post:', error);
                            Alert.alert("Error", "An error occurred while deleting the post");
                        }
                    }
                }
            ]
        );
    };

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

    // Format location for display
    const formattedLocation = post.locationName || 'Unknown location';

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen
                options={{
                    title: post.category || 'Post Detail',
                    headerRight: () => isAuthor ? (
                        <View style={styles.headerButtons}>
                            <TouchableOpacity onPressIn={handleEdit} style={styles.headerButton}>
                                <Ionicons name="pencil" size={24} color={Colors.light.tint} />
                            </TouchableOpacity>
                            <TouchableOpacity onPressIn={handleDelete} style={styles.headerButton}>
                                <Ionicons name="trash" size={24} color="#FF3B30" />
                            </TouchableOpacity>
                        </View>
                    ) : null
                }}
            />

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
                    <ThemedText style={styles.locationText}>📍 {formattedLocation}</ThemedText>
                    {post.location && (
                        <ThemedText style={styles.coordsText}>
                            Coordinates for map feature: {post.location.latitude.toFixed(4)}, {post.location.longitude.toFixed(4)}
                        </ThemedText>
                    )}
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
                    {post.authorName && (
                        <View style={styles.statItem}>
                            <ThemedText style={styles.statLabel}>Posted by</ThemedText>
                            <ThemedText style={styles.statValue}>{post.authorName}</ThemedText>
                        </View>
                    )}
                </View>



                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            liked && styles.actionButtonActive,
                            isAuthor && styles.actionButtonDisabled
                        ]}
                        onPress={handleLike}
                        disabled={!!liked || !!isAuthor}
                    >
                        <ThemedText style={styles.actionButtonText}>
                            👍 {isAuthor ? "Your Post" : liked ? 'Liked' : 'Like'}
                        </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            verified && styles.actionButtonActive,
                            isAuthor && styles.actionButtonDisabled
                        ]}
                        onPress={handleVerify}
                        disabled={!!verified || !!isAuthor}
                    >
                        <ThemedText style={styles.actionButtonText}>
                            ✅ {isAuthor ? "Your Post" : verified ? 'Verified' : 'Verify'}
                        </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleShare}
                    >
                        <ThemedText style={styles.actionButtonText}>📤 Share</ThemedText>
                    </TouchableOpacity>
                </View>




                {isAuthor && (
                    <View style={styles.authorActionsContainer}>
                        <TouchableOpacity
                            style={styles.authorActionButton}
                            onPress={handleEdit}
                        >
                            <Ionicons name="pencil" size={20} color="white" />
                            <ThemedText style={styles.authorActionButtonText}>Edit Post</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.authorActionButton, styles.deleteButton]}
                            onPress={handleDelete}
                        >
                            <Ionicons name="trash" size={20} color="white" />
                            <ThemedText style={styles.authorActionButtonText}>Delete Post</ThemedText>
                        </TouchableOpacity>
                    </View>
                )}






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
    headerButtons: {
        flexDirection: 'row',
        marginRight: 8,
    },
    headerButton: {
        marginLeft: 16,
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
    mapContainer: {
        height: 200,
        marginBottom: 16,
        borderRadius: 8,
        overflow: 'hidden',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    viewMapButton: {
        position: 'absolute',
        right: 8,
        bottom: 8,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    viewMapButtonText: {
        color: 'white',
        fontSize: 12,
    },
    locationContainer: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
    },
    locationText: {
        fontSize: 14,
        marginBottom: 4,
    },
    coordsText: {
        fontSize: 12,
        color: '#666',
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
    actionButtonActive: {
        backgroundColor: Colors.light.tint,
    },
    actionButtonText: {
        fontWeight: '500',
    },
    actionButtonDisabled: {
        backgroundColor: '#f0f0f0',
        opacity: 0.7,
    },
    authorActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    authorActionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.light.tint,
        padding: 10,
        borderRadius: 8,
        marginHorizontal: 4,
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
    },
    authorActionButtonText: {
        color: 'white',
        fontWeight: '500',
        marginLeft: 6,
    },
});