import { Feather } from '@expo/vector-icons';
import { getAccessToken } from 'auth/traktAuth';
import React, { useEffect, useState } from 'react';
import { View, Dimensions, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { ContributionGraph } from 'react-native-chart-kit';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

// Updated chartConfig to use colors from your tailwind.config.js
const chartConfig = {
    backgroundGradientFrom: '#170c09', // Matching your dark-700 theme color
    backgroundGradientTo: '#170c09', // Matching your dark-700 theme color
    color: (opacity = 1) => `rgba(210, 141, 45, ${opacity})`, // accent color
    strokeWidth: 0,
};

const formatDateRange = (endDate: any) => {
    const options = { month: 'short', year: 'numeric' };
    const end = endDate.toLocaleDateString('en-US', options);

    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - 6);
    const start = startDate.toLocaleDateString('en-US', options as Intl.DateTimeFormatOptions);

    return `${start} - ${end}`;
};

export const HeatMap = () => {
    const [periodData, setPeriodData] = useState<{ date: string; count: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const [endDate, setEndDate] = useState(new Date());
    const [totalInPeriod, setTotalInPeriod] = useState(0);

    useEffect(() => {
        const fetchHeatmapForPeriod = async () => {
            setLoading(true);
            const access_token = (await getAccessToken()) ?? '';
            const trakt_uuid = '3cb06afae6d4bac05d951e3e6895d4650d6e369c';

            // Format date as YYYY-MM-DD for the API query
            const endDateString = endDate.toISOString().split('T')[0];

            try {
                // The API now takes an endDate to paginate by 6-month periods
                // This assumes your backend is updated to handle this query parameter
                const res = await fetch(`${API_URL}/api/heatmap?endDate=${endDateString}`, {
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

        fetchHeatmapForPeriod();
    }, [endDate]); // This effect re-runs whenever the endDate changes

    const handlePrevious = () => {
        const newEndDate = new Date(endDate);
        newEndDate.setMonth(newEndDate.getMonth() - 6);
        setEndDate(newEndDate);
    };

    const handleNext = () => {
        const newEndDate = new Date(endDate);
        newEndDate.setMonth(newEndDate.getMonth() + 6);
        // Prevent navigating into the future
        if (newEndDate >= new Date()) {
            setEndDate(new Date());
        } else {
            setEndDate(newEndDate);
        }
    };

    // Disable the 'next' button if we are at the current date or in the future
    const isNextDisabled = endDate.getTime() >= new Date().getTime();

    if (loading) {
        return (
            <View className="flex h-56 items-center justify-center rounded-xl bg-dark-700">
                <ActivityIndicator size="large" color="#D28D2D" />
            </View>
        );
    }

    return (
        <View className="rounded-xl bg-dark-700 p-4">
            {/* Header with Navigation */}
            <View className="mb-2 flex-row items-center justify-between">
                <TouchableOpacity onPress={handlePrevious} className="p-2">
                    <Feather name="chevron-left" size={20} color="#FBF7F3" />
                </TouchableOpacity>
                <Text className="text-base font-semibold text-light-200">
                    {formatDateRange(endDate)}
                </Text>
                <TouchableOpacity onPress={handleNext} disabled={isNextDisabled} className="p-2">
                    <Feather
                        name="chevron-right"
                        size={20}
                        color={isNextDisabled ? '#736663' : '#FBF7F3'}
                    />
                </TouchableOpacity>
            </View>
            <Text className="mb-2 text-center text-sm font-semibold text-light-200/80">
                {`${totalInPeriod} contributions in this period`}
            </Text>

            {/* Contribution Graph */}
            <ContributionGraph
                values={periodData}
                endDate={endDate}
                numDays={183} // Approx 6 months
                width={Dimensions.get('window').width - 40}
                height={220}
                chartConfig={chartConfig}
                squareSize={16}
                gutterSize={2}
                tooltipDataAttrs={() => ({})}
            />
        </View>
    );
};
