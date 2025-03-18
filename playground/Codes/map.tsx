// app/(tabs)/map.tsx
import React, { useState, useEffect } from "react";
import { StyleSheet, View, ActivityIndicator, TouchableOpacity } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { fetchPublicPosts, PublicPost } from "@/Firebase/services/PostService";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";
import { useRouter } from "expo-router";

export default function MapScreen() {
    const [posts, setPosts] = useState<PublicPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Load user location and posts
        const loadLocationAndPosts = async () => {
            setLoading(true);

            try {
                // Request location permissions
                const { status } = await Location.requestForegroundPermissionsAsync();

                if (status !== "granted") {
                    setError("Location permission denied. Some features may be limited.");
                } else {
                    // Get user's current location
                    const location = await Location.getCurrentPositionAsync({});
                    setUserLocation(location);
                }

                // Fetch posts regardless of location permission
                const fetchedPosts = await fetchPublicPosts(50); // Get up to 50 posts
                setPosts(fetchedPosts);

            } catch (error) {
                console.error("Error loading map data:", error);
                setError("Failed to load map data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        loadLocationAndPosts();
    }, []);

    // Handle post marker press
    const handleMarkerPress = (post: PublicPost) => {
        // Navigate to post detail
        router.push({
            pathname: "/post/[id]",
            params: { id: post.id }
        });
    };

    // Get marker color based on category
    const getMarkerColor = (category: string): string => {
        const colors: Record<string, string> = {
            'Traffic': '#FF9500',
            'Safety': '#FF2D55',
            'Event': '#007AFF',
            'Infrastructure': '#34C759',
            'General': '#AF52DE',
        };

        return colors[category] || '#8E8E93';
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.tint} />
                <ThemedText style={styles.loadingText}>Loading map...</ThemedText>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {error && (
                <View style={styles.errorContainer}>
                    <ThemedText style={styles.errorText}>{error}</ThemedText>
                </View>
            )}

            <MapView
                style={styles.map}
                initialRegion={userLocation ? {
                    latitude: userLocation.coords.latitude,
                    longitude: userLocation.coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                } : {
                    // Default to a reasonable location if user location is not available
                    latitude: 47.6205,
                    longitude: -122.3493,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                }}
            >
                {/* User's current location marker */}
                {userLocation && (
                    <Marker
                        coordinate={{
                            latitude: userLocation.coords.latitude,
                            longitude: userLocation.coords.longitude,
                        }}
                        title="You are here"
                        pinColor="#2196F3"
                    />
                )}

                {/* Post markers */}
                {posts.map((post) => {
                    // Check if post has valid location data
                    // This is a placeholder - you'll need to adapt based on your actual post data structure
                    const latitude = post.location?.latitude || 0;
                    const longitude = post.location?.longitude || 0;

                    if (latitude === 0 && longitude === 0) {
                        return null; // Skip posts without valid location
                    }

                    return (
                        <Marker
                            key={post.id}
                            coordinate={{
                                latitude: latitude,
                                longitude: longitude,
                            }}
                            title={post.title}
                            description={post.category}
                            pinColor={getMarkerColor(post.category)}
                            onCalloutPress={() => handleMarkerPress(post)}
                        >
                            <Callout tooltip>
                                <View style={styles.calloutContainer}>
                                    <ThemedText style={styles.calloutTitle}>{post.title}</ThemedText>
                                    <ThemedText style={styles.calloutCategory}>{post.category}</ThemedText>
                                    <ThemedText style={styles.calloutText}>Tap to view details</ThemedText>
                                </View>
                            </Callout>
                        </Marker>
                    );
                })}
            </MapView>

            {/* Legend for marker categories */}
            <View style={styles.legendContainer}>
                <ThemedText style={styles.legendTitle}>Categories</ThemedText>
                <View style={styles.legendItems}>
                    {['Traffic', 'Safety', 'Event', 'Infrastructure', 'General'].map((category) => (
                        <View key={category} style={styles.legendItem}>
                            <View
                                style={[
                                    styles.legendColor,
                                    { backgroundColor: getMarkerColor(category) }
                                ]}
                            />
                            <ThemedText style={styles.legendText}>{category}</ThemedText>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
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
    errorContainer: {
        backgroundColor: "#FFE5E5",
        padding: 12,
        margin: 12,
        borderRadius: 6,
    },
    errorText: {
        color: "#FF2D55",
        fontSize: 14,
    },
    map: {
        flex: 1,
    },
    calloutContainer: {
        backgroundColor: "white",
        borderRadius: 8,
        padding: 12,
        width: 200,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    calloutTitle: {
        fontWeight: "bold",
        fontSize: 16,
        marginBottom: 4,
    },
    calloutCategory: {
        fontSize: 14,
        color: "#666",
        marginBottom: 4,
    },
    calloutText: {
        fontSize: 12,
        color: Colors.light.tint,
        fontStyle: "italic",
    },
    legendContainer: {
        position: "absolute",
        bottom: 20,
        right: 20,
        backgroundColor: "white",
        borderRadius: 8,
        padding: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    legendTitle: {
        fontWeight: "bold",
        marginBottom: 6,
    },
    legendItems: {
        flexDirection: "column",
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 4,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    legendText: {
        fontSize: 12,
    },
});