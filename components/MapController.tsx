/**
 * Control panel for the map view that allows filtering posts by category and time.
 * Provides an interface for users to customize which markers are displayed on the map.
 */
import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';

interface MapControllerProps {
    categories: string[];
    selectedCategories: string[];
    onSelectCategory: (category: string) => void;
    onSelectAll: () => void;
    onClearAll: () => void;
}

export function MapController({
    categories,
    selectedCategories,
    onSelectCategory,
    onSelectAll,
    onClearAll
}: MapControllerProps) {
    return (
        <ThemedView style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        { backgroundColor: selectedCategories.length === categories.length ? Colors.light.tint : '#f0f0f0' }
                    ]}
                    onPressIn={onSelectAll}
                >
                    <Text style={{
                        color: selectedCategories.length === categories.length ? 'white' : '#333',
                        fontWeight: 'bold'
                    }}>
                        All
                    </Text>
                </TouchableOpacity>

                {categories.map(category => (
                    <TouchableOpacity
                        key={category}
                        style={[
                            styles.filterButton,
                            { backgroundColor: selectedCategories.includes(category) ? Colors.light.tint : '#f0f0f0' }
                        ]}
                        onPressIn={() => onSelectCategory(category)}
                    >
                        <Text style={{
                            color: selectedCategories.includes(category) ? 'white' : '#333',
                            fontWeight: '500'
                        }}>
                            {category}
                        </Text>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity
                    style={[styles.filterButton, { backgroundColor: '#f0f0f0' }]}
                    onPressIn={onClearAll}
                >
                    <Text style={{ color: '#666' }}>Clear</Text>
                </TouchableOpacity>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 8,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    scrollContent: {
        paddingHorizontal: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        marginRight: 8,
        backgroundColor: '#f0f0f0',
    },
});