
/**
 * Header component for the public content section of the app.
 * Displays app title and subtitle information for guest users.
 */

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export function PublicContentHeader() {
    return (


        <>
            <Text style={styles.title}>Home Screen</Text>
            <Text style={styles.subtitle}>Public content available to all users</Text>

        </>



    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingTop: 8,
    },

    titleContainer: {
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        opacity: 0.7,
        marginTop: 4,
    },

    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
    },


});