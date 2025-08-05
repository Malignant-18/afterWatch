import React from 'react';
import { View, Dimensions } from 'react-native';
import { ContributionGraph } from 'react-native-chart-kit';

const commitsData = [
    { date: '2017-01-02', count: 1 },
    { date: '2017-01-03', count: 2 },
    { date: '2017-01-04', count: 3 },
    { date: '2017-01-05', count: 4 },
    { date: '2017-01-06', count: 5 },
    { date: '2017-01-30', count: 2 },
    { date: '2017-01-31', count: 3 },
    { date: '2017-03-01', count: 2 },
    { date: '2017-04-02', count: 4 },
    { date: '2017-03-05', count: 2 },
    { date: '2017-02-30', count: 4 },
];
const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(33, 110, 57, ${opacity})`, // Base color for the squares
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
};
export const Heatmap = () => {
    const handleToolTip: any = {};
    return (
        <View className="h-20 w-full border-2 border-black bg-light-300">
            <ContributionGraph
                values={commitsData}
                endDate={new Date('2017-04-01')}
                numDays={105}
                width={Dimensions.get('window').width - 20} // from react-native
                height={220}
                chartConfig={chartConfig}
                tooltipDataAttrs={(value) => handleToolTip}
            />
        </View>
    );
};
