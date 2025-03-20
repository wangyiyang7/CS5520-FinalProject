import { View, Text, Button, Alert, Image } from 'react-native'
import React, { useState } from 'react'
import { launchCameraAsync, useCameraPermissions } from 'expo-image-picker'

interface ImageManagerProps {
    onImageUri: (uri: string) => void;
}

interface ImagePickerResult {
    assets: { uri: string }[];
}

const ImageManager: React.FC<ImageManagerProps> = ({ onImageUri }) => {
    const [permissionResponse, setPermissionResponse] = useCameraPermissions();
    const [imageUri, setImageUri] = useState<string | undefined>(undefined);

    async function verifyPermissions(): Promise<boolean> {
        if (permissionResponse?.granted) {
            console.log("Permission Granted");
            return true;
        }
        return false;
    }

    async function takeImageHandler(): Promise<void> {
        const hasPermission = await verifyPermissions();

        if (!hasPermission) {
            Alert.alert("You need to give permission to access Camera");
            return;
        }

        try {
            const result = await launchCameraAsync({
                allowsEditing: true,
                aspect: [16, 9],
                quality: 1
            });

            if (result && (result as ImagePickerResult).assets && (result as ImagePickerResult).assets.length > 0) {
                const uri = (result as ImagePickerResult).assets[0].uri;
                setImageUri(uri);
                onImageUri(uri);
            }

            console.log("Result--", result);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <View>
            <Button title="Take an Image" onPress={() => takeImageHandler()} />
            {imageUri && <Image source={{ uri: imageUri }} style={{ width: 200, height: 200 }} />}
        </View>
    );
};

export default ImageManager