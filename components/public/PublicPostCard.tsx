
/**
 * Reusable card component for displaying post information.
 * Renders post title, content, category, time, location, and optional image.
 */

import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { PublicPost } from '@/Firebase/services/PostService';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Helper function to format date
const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // diff in seconds

    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
};

// Component for category badges
export const CategoryBadge = ({ category }: { category: string }) => {
    const colorScheme = useColorScheme() ?? 'light';
    const colors: Record<string, { bg: string, text: string }> = {
        'Traffic': { bg: '#FFF4E5', text: '#FF9500' },
        'Safety': { bg: '#FFE5E5', text: '#FF2D55' },
        'Event': { bg: '#E5F1FF', text: '#007AFF' },
        'Infrastructure': { bg: '#E5FFE8', text: '#34C759' },
        'General': { bg: '#F2E5FF', text: '#AF52DE' },
    };

    const defaultColor = { bg: '#F2F2F7', text: '#8E8E93' };
    const color = colors[category] || defaultColor;

    return (
        <View style={[styles.badge, { backgroundColor: color.bg }]}>
            <Text style={[styles.badgeText, { color: color.text }]}>{category}</Text>
        </View>
    );
};

interface PublicPostCardProps {
    post: PublicPost;
    onPress: (post: PublicPost) => void;
}

export function PublicPostCard({ post, onPress }: PublicPostCardProps) {
    const colorScheme = useColorScheme() ?? 'light';

    return (
        <TouchableOpacity
            onPress={() => onPress(post)}
            activeOpacity={0.7}
        >
            <ThemedView style={styles.card}>
                <View style={styles.header}>
                    <CategoryBadge category={post.category} />
                    <ThemedText style={styles.time}>{formatDate(post.createdAt)}</ThemedText>
                </View>

                <ThemedText type="defaultSemiBold" style={styles.title}>{post.title}</ThemedText>

                <ThemedText numberOfLines={2} style={styles.content}>{post.content}</ThemedText>


                {post.photoURL && (
                    <Image
                        source={{ uri: post.photoURL }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                )}

                <View style={styles.footer}>
                    <ThemedText style={styles.location}>📍 {post.location}</ThemedText>
                    <ThemedText style={styles.location}>👍 {post.likes}</ThemedText>
                    <ThemedText style={styles.location}>✅ {post.verified}</ThemedText>


                </View>
            </ThemedView>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    time: {
        fontSize: 12,
        color: '#8E8E93',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: 'navibluetext',
    },
    content: {
        marginBottom: 12,
        fontSize: 14,
    },
    image: {
        width: '100%',
        height: 100,
        borderRadius: 8,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    location: {
        fontSize: 12,
        color: '#8E8E93',
    }
});