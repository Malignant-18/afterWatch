import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import React, { useRef, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type SheetyProps = {
    isVisible: boolean;
    onClose: () => void;
};

const Sheety = ({ isVisible, onClose }: SheetyProps) => {
    console.log('📘 [ExampleSheet] Rendered. isVisible:', isVisible);

    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => {
        console.log('📘 [ExampleSheet] Creating snap points: [25%, 50%, 75%]');
        return ['25%', '50%', '75%'];
    }, []);

    useEffect(() => {
        console.log('📘 [ExampleSheet] useEffect triggered. isVisible:', isVisible);
        if (isVisible) {
            console.log('📘 [ExampleSheet] Attempting to open sheet...');
            setTimeout(() => {
                bottomSheetRef.current?.snapToIndex(0);
                console.log('📘 [ExampleSheet] snapToIndex(0) called');
            }, 100);
        } else {
            console.log('📘 [ExampleSheet] Attempting to close sheet...');
            bottomSheetRef.current?.close();
        }
    }, [isVisible]);

    const handleSheetChange = useCallback(
        (index: number) => {
            console.log('📘 [ExampleSheet] Sheet index changed to:', index);
            if (index === -1) {
                console.log('📘 [ExampleSheet] Sheet closed, calling onClose');
                onClose();
            }
        },
        [onClose]
    );

    const handleClose = useCallback(() => {
        console.log('📘 [ExampleSheet] Close button pressed');
        bottomSheetRef.current?.close();
    }, []);

    const renderBackdrop = useCallback((props: any) => {
        console.log('📘 [ExampleSheet] Rendering backdrop');
        return (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                pressBehavior="close"
                opacity={0.5}
            />
        );
    }, []);

    console.log('📘 [ExampleSheet] Rendering BottomSheet component');

    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose
            onChange={handleSheetChange}
            backdropComponent={renderBackdrop}
            backgroundStyle={styles.bottomSheetBackground}
            handleIndicatorStyle={styles.handleIndicator}
            onAnimate={(fromIndex, toIndex) => {
                console.log('📘 [ExampleSheet] Animating from', fromIndex, 'to', toIndex);
            }}>
            <BottomSheetView style={styles.contentContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>🎉 Awesome Bottom Sheet</Text>
                    <Text style={styles.subtitle}>Drag up/down to snap to different heights!</Text>
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>✨ Features:</Text>
                    <Text style={styles.infoText}>• Snap to 25%, 50%, or 75%</Text>
                    <Text style={styles.infoText}>• Smooth 60fps animations</Text>
                    <Text style={styles.infoText}>• Native performance</Text>
                    <Text style={styles.infoText}>• Drag to dismiss</Text>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                        <Text style={styles.closeButtonText}>Close Sheet</Text>
                    </TouchableOpacity>
                </View>
            </BottomSheetView>
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    bottomSheetBackground: {
        backgroundColor: '#F9F5F0',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    handleIndicator: {
        backgroundColor: '#0a0502',
        width: 40,
        height: 4,
    },
    contentContainer: {
        flex: 1,
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0a0502',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
    },
    infoBox: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 2,
        borderColor: '#e5e7eb',
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0a0502',
        marginBottom: 12,
    },
    infoText: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 6,
        lineHeight: 20,
    },
    buttonContainer: {
        alignItems: 'center',
        marginTop: 'auto',
    },
    closeButton: {
        backgroundColor: '#4f46e5',
        paddingHorizontal: 40,
        paddingVertical: 14,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    closeButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default Sheety;
