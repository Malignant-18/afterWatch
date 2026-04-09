import { Feather } from '@expo/vector-icons';
import { getAccessToken } from 'auth/traktAuth'; // Assuming this is a utility you have
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { ContributionGraph } from 'react-native-chart-kit';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

// Chart configuration with added label styling
const chartConfig = {
    backgroundGradientFrom: '#170c09',
    backgroundGradientTo: '#170c09',
    color: (opacity = 1) => `rgba(210, 141, 45, ${opacity})`,
    strokeWidth: 0,
    propsForLabels: {
        fontSize: 10,
        fill: '#A3A3A3', // A light gray for month labels
    },
};

/**
 * Formats the date range label for a 4-month period.
 */
const formatDateRange = (refDate: Date): string => {
    const year = refDate.getFullYear();
    const month = refDate.getMonth(); // 0-11

    if (month < 4) return `Jan ${year} - Apr ${year}`;
    if (month < 8) return `May ${year} - Aug ${year}`;
    return `Sep ${year} - Dec ${year}`;
};

/**
 * Calculates the exact end date for the 4-month contribution graph period.
 */
const getPeriodEndDate = (refDate: Date): Date => {
    const year = refDate.getFullYear();
    const month = refDate.getMonth();

    if (month < 4) return new Date(year, 3, 30); // Apr 30
    if (month < 8) return new Date(year, 7, 31); // Aug 31
    return new Date(year, 11, 31); // Dec 31
};

export const HeatMap = () => {
    const [periodData, setPeriodData] = useState<{ date: string; count: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const [referenceDate, setReferenceDate] = useState(new Date());
    const [totalInPeriod, setTotalInPeriod] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        const fetchHeatmapForPeriod = async () => {
            setLoading(true);
            const access_token = (await getAccessToken()) ?? '';
            const trakt_uuid = '3cb06afae6d4bac05d951e3e6895d4650d6e369c';

            const year = referenceDate.getFullYear();
            const month = referenceDate.getMonth();

            // Determine which third of the year we are in
            let third;
            if (month < 4) third = 1;
            else if (month < 8) third = 2;
            else third = 3;

            try {
                const res = await fetch(`${API_URL}/api/heatmap?year=${year}&third=${third}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'trakt-api-version': '2',
                        trakt_uuid,
                        access_token,
                    },
                });
                const json = await res.json();

                if (json?.days && Array.isArray(json.days)) {
                    setPeriodData(json.days);
                    const total = json.days.reduce(
                        (sum: number, day: { count: number }) => sum + day.count,
                        0
                    );
                    setTotalInPeriod(total);
                } else {
                    setPeriodData([]);
                    setTotalInPeriod(0);
                }
            } catch (err) {
                console.error('Heatmap fetch error:', err);
                setPeriodData([]);
                setTotalInPeriod(0);
            } finally {
                setLoading(false);
            }
        };

        if (containerWidth > 0) {
            fetchHeatmapForPeriod();
        }
    }, [referenceDate, containerWidth]);

    const handlePrevious = () => {
        const newRefDate = new Date(referenceDate);
        newRefDate.setMonth(newRefDate.getMonth() - 4); // Navigate by 4 months
        setReferenceDate(newRefDate);
    };

    const handleNext = () => {
        const newRefDate = new Date(referenceDate);
        newRefDate.setMonth(newRefDate.getMonth() + 4); // Navigate by 4 months
        if (newRefDate <= new Date()) {
            setReferenceDate(newRefDate);
        }
    };

    const nextPeriodDate = new Date(referenceDate);
    nextPeriodDate.setMonth(nextPeriodDate.getMonth() + 4);
    const isNextDisabled = nextPeriodDate > new Date();

    // --- Dynamic Sizing for 4 months ---
    const numDays = 122; // Approx 4 months
    const numWeeks = Math.ceil(numDays / 7);
    const gutterSize = 2;
    const monthLabelSpacing = 25;

    const calculatedSquareSize =
        containerWidth > 0
            ? (containerWidth - monthLabelSpacing - (numWeeks - 1) * gutterSize) / numWeeks
            : 0;

    if (loading || containerWidth === 0) {
        return (
            <View
                className="h-56 items-center justify-center rounded-b-2xl bg-dark-700"
                onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}>
                <ActivityIndicator size="large" color="#D28D2D" />
            </View>
        );
    }

    return (
        <View
            className="rounded-b-2xl bg-dark-700 py-4"
            onLayout={(event) => {
                if (containerWidth === 0) setContainerWidth(event.nativeEvent.layout.width);
            }}>
            <View className="mb-2 flex-row items-center justify-between px-4">
                <TouchableOpacity onPress={handlePrevious} className="p-2">
                    <Feather name="chevron-left" size={20} color="#FBF7F3" />
                </TouchableOpacity>
                <Text className="text-base font-semibold text-light-200">
                    {formatDateRange(referenceDate)}
                </Text>
                <TouchableOpacity onPress={handleNext} disabled={isNextDisabled} className="p-2">
                    <Feather
                        name="chevron-right"
                        size={20}
                        color={isNextDisabled ? '#736663' : '#FBF7F3'}
                    />
                </TouchableOpacity>
            </View>
            <Text className="mb-2 px-4 text-center text-sm font-semibold text-light-200/80">
                {`${totalInPeriod} contributions in this period`}
            </Text>

            {containerWidth > 0 && (
                <ContributionGraph
                    values={periodData}
                    endDate={getPeriodEndDate(referenceDate)}
                    numDays={numDays}
                    width={containerWidth}
                    height={220}
                    chartConfig={chartConfig}
                    squareSize={16}
                    gutterSize={gutterSize}
                    tooltipDataAttrs={() => ({})}
                />
            )}
        </View>
    );
};
