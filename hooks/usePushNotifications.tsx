// hooks/usePushNotifications.tsx
import { useEffect, useContext } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { updateUserPushToken } from '@/Firebase/services/UserService';
import { AuthContext } from '@/components/AuthContext';

export function usePushNotifications() {
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        // Only register for push if a user is logged in
        if (!currentUser) return;

        async function registerForPushNotifications() {
            try {
                // Request permission
                const { status: existingStatus } = await Notifications.getPermissionsAsync();
                let finalStatus = existingStatus;

                if (existingStatus !== 'granted') {
                    const { status } = await Notifications.requestPermissionsAsync();
                    finalStatus = status;
                }


                if (finalStatus !== 'granted') {
                    console.log('Push notification permissions NOT granted!');
                    return;
                } else {
                    console.log('Push notification permissions ARE granted!');
                }

                // if (finalStatus !== 'granted') {
                //     console.log('Failed to get push token for push notification!');
                //     return;
                // }

                // Get the token
                const token = (await Notifications.getExpoPushTokenAsync({
                    projectId: process.env.EXPO_PUBLIC_ExpoProjectId, // You'll need to add this to your .env file
                })).data;


                // console.log("===========Expo Push Token:========", token);


                // Store the token in the user's profile
                if (token && currentUser && currentUser.uid) {
                    await updateUserPushToken(currentUser.uid, token);
                }

                // Set up notification handler
                Notifications.setNotificationHandler({
                    handleNotification: async () => ({
                        shouldShowAlert: true,
                        shouldPlaySound: true,
                        shouldSetBadge: true,
                    }),
                });

                // Configure for Android
                if (Platform.OS === 'android') {
                    Notifications.setNotificationChannelAsync('default', {
                        name: 'default',
                        importance: Notifications.AndroidImportance.MAX,
                        vibrationPattern: [0, 250, 250, 250],
                        lightColor: '#FF231F7C',
                    });
                }
            } catch (error) {
                console.log('Using projectId:', process.env.EXPO_PUBLIC_ExpoProjectId);
                console.error('Error setting up push notifications:', error);
            }
        }

        registerForPushNotifications();
    }, [currentUser]);


    useEffect(() => {
        const subscription = Notifications.addNotificationReceivedListener(notification => {
            console.log('Notification received!', notification);
        });

        const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Notification response received!', response);
        });

        return () => {
            subscription.remove();
            responseSubscription.remove();
        };
    }, []);



}