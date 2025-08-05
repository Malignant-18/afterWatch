import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
// 1. Import FlatList directly from react-native for best practice
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import ActionSheet, { SheetManager, FlatList } from 'react-native-actions-sheet';

type RatingSheetProps = {
  sheetId: string;
  payload?: any;
};

// 2. Create a larger dataset to ensure the list is long enough to scroll
const largeData = Array.from({ length: 30 }, (_, i) => `List Item #${i + 1}`);

const ExampleSheet = ({ sheetId, payload }: RatingSheetProps) => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const handleItemPress = (item: string) => {
    
    // Toggle the expanded state for the clicked item
    setExpandedItem(expandedItem === item ? null : item);
  };

  const renderItem = ({ item }: { item: string }) => (
    <View>
      <TouchableOpacity
        onPress={() => handleItemPress(item)}
        className="m-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <View className="flex-row justify-between items-center">
          <Text className="text-base text-indigo-600">{item}</Text>
          <Ionicons 
            name={expandedItem === item ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#6366f1" 
          />
        </View>
      </TouchableOpacity>
      
      {/* Rickroll message that appears below the pressed item */}
      {expandedItem === item && (
        <View className="mx-2 mb-2 rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <View className="flex-row items-center justify-center mb-2">
            <Ionicons name="musical-notes" size={24} color="#dc2626" />
            <Text className="text-lg font-bold text-red-600 ml-2">
              You are rickrolled! 🎵
            </Text>
            <Ionicons name="musical-notes" size={24} color="#dc2626" />
          </View>
          <Text className="text-center text-red-500 text-sm italic">
            "Never gonna give you up, never gonna let you down!" 🕺
          </Text>
          <TouchableOpacity 
            onPress={() => setExpandedItem(null)}
            className="mt-3 bg-red-100 rounded-full py-2 px-4 self-center"
          >
            <Text className="text-red-600 text-sm font-medium">Close</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <ActionSheet
      id={sheetId}
      containerStyle={{
        backgroundColor: '#FDFBFA',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        height: '73%',
        maxHeight: 500,
        minHeight: 400,
      }}
      // Use a responsive height
      gestureEnabled>
      <FlatList
        data={largeData}
        showsVerticalScrollIndicator
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </ActionSheet>
  );
};

export default ExampleSheet;