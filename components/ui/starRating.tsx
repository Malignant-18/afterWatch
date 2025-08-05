// src/components/common/StarRating.tsx

import { AntDesign } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, ScrollView } from 'react-native';

type StarRatingProps = {
    /**
     * The current rating value (0-10).
     */
    rating: number;
    /**
     * Callback function that is called with the new rating when a star is pressed.
     */
    onRate: (rating: number) => void;
    /**
     * The maximum rating value. Defaults to 10.
     */
    maxRating?: number;
    /**
     * The size of the star icons. Defaults to a smaller size to fit 10 stars.
     */
    size?: number;
    /**
     * The color of the filled star icons.
     */
    color?: string;
};

/**
 * A reusable, pressable star rating component, optimized for a 10-star layout.
 */
const StarRating = ({
    rating,
    onRate,
    maxRating = 10, // Default to 10 for Trakt
    size = 32, // A smaller size to help all 10 stars fit comfortably
    color = '#C7A87F',
}: StarRatingProps) => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 3,
            }}>
            {/* Create an array of stars from 1 to maxRating */}
            {Array.from({ length: maxRating }, (_, index) => {
                const starNumber = index + 1;
                return (
                    <TouchableOpacity
                        key={starNumber}
                        onPress={() => onRate(starNumber)}
                        activeOpacity={0.9}
                        // Use a smaller horizontal margin to bring stars closer together
                        style={{ marginHorizontal: 2 }}>
                        <AntDesign
                            name={starNumber <= rating ? 'star' : 'staro'}
                            size={size}
                            color={color}
                        />
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
};

export default StarRating;
