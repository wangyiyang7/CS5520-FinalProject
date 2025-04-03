/**
 * Post filters component for filtering the posts list
 * Provides search, category filtering, radius adjustment, and sort options
 */
import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    TextInput,
    TouchableOpacity,
    Text,
    ScrollView,
    Modal,
    Pressable,
    Platform
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import Slider from '@react-native-community/slider';

export type FilterState = {
    searchText: string;
    selectedCategories: string[];
    radius: number;
    sortBy: 'newest' | 'oldest' | 'popular' | 'proximity';
};

interface PostFiltersProps {
    filterState: FilterState;
    setFilterState: (state: FilterState) => void;
    availableCategories: string[];
    onApplyFilters: () => void;
}

export function PostFilters({
    filterState,
    setFilterState,
    availableCategories,
    onApplyFilters
}: PostFiltersProps) {
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [tempFilterState, setTempFilterState] = useState<FilterState>({ ...filterState });

    // Handle search text changes
    const handleSearchChange = (text: string) => {
        setFilterState({
            ...filterState,
            searchText: text
        });
    };

    // Handle category selection
    const toggleCategory = (category: string) => {
        setTempFilterState(prev => {
            const newSelectedCategories = prev.selectedCategories.includes(category)
                ? prev.selectedCategories.filter(c => c !== category)
                : [...prev.selectedCategories, category];

            return {
                ...prev,
                selectedCategories: newSelectedCategories
            };
        });
    };

    // Handle radius change
    const handleRadiusChange = (value: number) => {
        setTempFilterState({
            ...tempFilterState,
            radius: Math.round(value)
        });
    };

    // Handle sort option selection
    const handleSortChange = (sortOption: FilterState['sortBy']) => {
        setTempFilterState({
            ...tempFilterState,
            sortBy: sortOption
        });
    };

    // Apply filters from the modal
    const applyFilters = () => {
        setFilterState(tempFilterState);
        setShowFilterModal(false);
        onApplyFilters();
    };

    // Reset all filters
    const resetFilters = () => {
        const resetState = {
            searchText: '',
            selectedCategories: [],
            radius: 5,
            sortBy: 'newest' as const
        };
        setTempFilterState(resetState);
        setFilterState(resetState);
        onApplyFilters();
    };

    // Open filter modal
    const openFilterModal = () => {
        setTempFilterState({ ...filterState });
        setShowFilterModal(true);
    };

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search posts..."
                    value={filterState.searchText}
                    onChangeText={handleSearchChange}
                    returnKeyType="search"
                />

                {filterState.searchText ? (
                    <TouchableOpacity
                        onPress={() => handleSearchChange('')}
                        style={styles.clearButton}
                    >
                        <Ionicons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={openFilterModal}
                >
                    <Ionicons
                        name="options"
                        size={22}
                        color={
                            filterState.selectedCategories.length > 0 ||
                                filterState.radius !== 5 ||
                                filterState.sortBy !== 'newest'
                                ? Colors.light.tint
                                : "#666"
                        }
                    />
                </TouchableOpacity>
            </View>

            {/* Filter Pills */}
            {(filterState.selectedCategories.length > 0 ||
                filterState.radius !== 5 ||
                filterState.sortBy !== 'newest') && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.pillsContainer}
                        contentContainerStyle={styles.pillsContent}
                    >
                        {filterState.selectedCategories.map(category => (
                            <View key={category} style={styles.pill}>
                                <Text style={styles.pillText}>{category}</Text>
                            </View>
                        ))}

                        {/* {filterState.radius !== 5 && (
                            <View style={styles.pill}>
                                <Text style={styles.pillText}>{filterState.radius}km radius</Text>
                            </View>
                        )} */}

                        {filterState.radius > 0 && (
                            <View style={styles.pill}>
                                <Text style={styles.pillText}>{filterState.radius}km radius</Text>
                            </View>
                        )}

                        {/* {filterState.radius > 0 ? (
  <View style={styles.pill}>
    <Text style={styles.pillText}>{filterState.radius}km radius</Text>
  </View>
) : (
  <View style={styles.pill}>
    <Text style={styles.pillText}>All posts</Text>
  </View>
)} */}


                        {filterState.sortBy !== 'newest' && (
                            <View style={styles.pill}>
                                <Text style={styles.pillText}>Sort: {filterState.sortBy}</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.pill, styles.resetPill]}
                            onPress={resetFilters}
                        >
                            <Text style={[styles.pillText, styles.resetPillText]}>Reset</Text>
                        </TouchableOpacity>
                    </ScrollView>
                )}

            {/* Filter Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showFilterModal}
                onRequestClose={() => setShowFilterModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filter Posts</Text>
                            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {/* Categories Section */}
                        <View style={styles.filterSection}>
                            <Text style={styles.sectionTitle}>Categories</Text>
                            <View style={styles.categoriesContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.categoryButton,
                                        tempFilterState.selectedCategories.length === availableCategories.length && styles.categoryButtonActive
                                    ]}
                                    onPress={() => {
                                        if (tempFilterState.selectedCategories.length === availableCategories.length) {
                                            setTempFilterState({ ...tempFilterState, selectedCategories: [] });
                                        } else {
                                            setTempFilterState({ ...tempFilterState, selectedCategories: [...availableCategories] });
                                        }
                                    }}
                                >
                                    <Text style={tempFilterState.selectedCategories.length === availableCategories.length
                                        ? styles.categoryTextActive
                                        : styles.categoryText
                                    }>
                                        All Categories
                                    </Text>
                                </TouchableOpacity>

                                {availableCategories.map(category => (
                                    <TouchableOpacity
                                        key={category}
                                        style={[
                                            styles.categoryButton,
                                            tempFilterState.selectedCategories.includes(category) && styles.categoryButtonActive
                                        ]}
                                        onPress={() => toggleCategory(category)}
                                    >
                                        <Text
                                            style={tempFilterState.selectedCategories.includes(category)
                                                ? styles.categoryTextActive
                                                : styles.categoryText
                                            }
                                        >
                                            {category}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Radius Section */}
                        <View style={styles.filterSection}>
                            {/* <Text style={styles.sectionTitle}>Distance (km): {tempFilterState.radius}km</Text> */}


                            <Text style={styles.sectionTitle}>
                                Distance: {tempFilterState.radius > 0 ? `${tempFilterState.radius}km` : 'All posts'}
                            </Text>


                            <Slider
                                style={styles.slider}
                                minimumValue={0}  // Changed from 1 to 0
                                maximumValue={20}
                                step={1}
                                value={tempFilterState.radius}
                                onValueChange={handleRadiusChange}
                                minimumTrackTintColor={Colors.light.tint}
                                maximumTrackTintColor="#ddd"
                                thumbTintColor={Colors.light.tint}
                            />
                            <View style={styles.sliderLabels}>
                                <Text style={styles.sliderLabel}>All</Text>
                                <Text style={styles.sliderLabel}>20km</Text>
                            </View>

                            {/* <Slider
                                style={styles.slider}
                                minimumValue={1}
                                maximumValue={20}
                                step={1}
                                value={tempFilterState.radius}
                                onValueChange={handleRadiusChange}
                                minimumTrackTintColor={Colors.light.tint}
                                maximumTrackTintColor="#ddd"
                                thumbTintColor={Colors.light.tint}
                            />
                            <View style={styles.sliderLabels}>
                                <Text style={styles.sliderLabel}>1km</Text>
                                <Text style={styles.sliderLabel}>20km</Text>
                            </View> */}
                        </View>

                        {/* Sort Options */}
                        <View style={styles.filterSection}>
                            <Text style={styles.sectionTitle}>Sort By</Text>
                            <View style={styles.sortOptions}>
                                <TouchableOpacity
                                    style={[
                                        styles.sortButton,
                                        tempFilterState.sortBy === 'newest' && styles.sortButtonActive
                                    ]}
                                    onPress={() => handleSortChange('newest')}
                                >
                                    <Text style={tempFilterState.sortBy === 'newest' ? styles.sortTextActive : styles.sortText}>
                                        Newest
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.sortButton,
                                        tempFilterState.sortBy === 'oldest' && styles.sortButtonActive
                                    ]}
                                    onPress={() => handleSortChange('oldest')}
                                >
                                    <Text style={tempFilterState.sortBy === 'oldest' ? styles.sortTextActive : styles.sortText}>
                                        Oldest
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.sortButton,
                                        tempFilterState.sortBy === 'popular' && styles.sortButtonActive
                                    ]}
                                    onPress={() => handleSortChange('popular')}
                                >
                                    <Text style={tempFilterState.sortBy === 'popular' ? styles.sortTextActive : styles.sortText}>
                                        Most Popular
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.sortButton,
                                        tempFilterState.sortBy === 'proximity' && styles.sortButtonActive
                                    ]}
                                    onPress={() => handleSortChange('proximity')}
                                >
                                    <Text style={tempFilterState.sortBy === 'proximity' ? styles.sortTextActive : styles.sortText}>
                                        Closest First
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={styles.resetButton}
                                onPress={() => {
                                    setTempFilterState({
                                        searchText: '',
                                        selectedCategories: [],
                                        radius: 5,
                                        sortBy: 'newest'
                                    });
                                }}
                            >
                                <Text style={styles.resetButtonText}>Reset</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.applyButton}
                                onPress={applyFilters}
                            >
                                <Text style={styles.applyButtonText}>Apply Filters</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 8,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
    },
    clearButton: {
        padding: 4,
    },
    filterButton: {
        padding: 8,
        marginLeft: 8,
    },
    pillsContainer: {
        marginBottom: 12,
    },
    pillsContent: {
        paddingRight: 20,
    },
    pill: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
    },
    pillText: {
        fontSize: 12,
        color: '#333',
    },
    resetPill: {
        backgroundColor: '#ffeeee',
    },
    resetPillText: {
        color: 'red',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: Platform.OS === 'ios' ? '95%' : '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    filterSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    categoryButton: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    categoryButtonActive: {
        backgroundColor: Colors.light.tint,
    },
    categoryText: {
        color: '#333',
    },
    categoryTextActive: {
        color: 'white',
    },
    slider: {
        width: '100%',
        height: 40,
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: -10,
    },
    sliderLabel: {
        color: '#666',
        fontSize: 12,
    },
    sortOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    sortButton: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    sortButtonActive: {
        backgroundColor: Colors.light.tint,
    },
    sortText: {
        color: '#333',
    },
    sortTextActive: {
        color: 'white',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    resetButton: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        flex: 1,
        marginRight: 8,
        alignItems: 'center',
    },
    resetButtonText: {
        color: '#666',
        fontWeight: '500',
    },
    applyButton: {
        backgroundColor: Colors.light.tint,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        flex: 2,
        alignItems: 'center',
    },
    applyButtonText: {
        color: 'white',
        fontWeight: '500',
    },
});