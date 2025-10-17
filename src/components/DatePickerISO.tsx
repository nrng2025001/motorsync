/**
 * DatePickerISO Component
 * Date picker that returns ISO-8601 formatted dates for API compatibility
 * Fallback implementation for when native date picker is not available
 */

import React, { useState } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Text, TextInput, HelperText, Button, Card } from 'react-native-paper';
import { formatDateForAPI } from '../services/api.config';

interface DatePickerISOProps {
  label: string;
  value?: string; // ISO date string
  onChange: (isoDate: string) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  error?: string;
  disabled?: boolean;
  style?: any; // Add style prop for compatibility
}

export function DatePickerISO({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
  error,
  disabled = false,
  style,
}: DatePickerISOProps): React.JSX.Element {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(
    value ? new Date(value) : new Date()
  );

  const formatDisplayDate = (isoString?: string): string => {
    if (!isoString) return 'Select date';
    
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return 'Select date';
    }
  };

  const handlePress = () => {
    if (!disabled) {
      setShowPicker(true);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const isoDate = formatDateForAPI(date);
    onChange(isoDate);
    setShowPicker(false);
  };

  const handleCancel = () => {
    setShowPicker(false);
  };

  // Generate date options (next 30 days)
  const generateDateOptions = () => {
    const options = [];
    const today = new Date();
    const maxDate = maximumDate || new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const minDate = minimumDate || today;
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      if (date >= minDate && date <= maxDate) {
        options.push(date);
      }
    }
    return options;
  };

  const dateOptions = generateDateOptions();

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity onPress={handlePress} disabled={disabled}>
        <TextInput
          label={label}
          value={formatDisplayDate(value)}
          editable={false}
          mode="outlined"
          right={<TextInput.Icon icon="calendar" onPress={handlePress} disabled={disabled} />}
          error={!!error}
          disabled={disabled}
          style={styles.input}
        />
      </TouchableOpacity>
      
      {error && (
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
      )}

      <Modal
        visible={showPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Card.Content>
              <Text variant="headlineSmall" style={styles.modalTitle}>
                Select Date
              </Text>
              <ScrollView style={styles.dateList} showsVerticalScrollIndicator={false}>
                {dateOptions.map((date, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dateOption,
                      selectedDate.toDateString() === date.toDateString() && styles.selectedDateOption
                    ]}
                    onPress={() => handleDateSelect(date)}
                  >
                    <Text style={[
                      styles.dateOptionText,
                      selectedDate.toDateString() === date.toDateString() && styles.selectedDateOptionText
                    ]}>
                      {date.toLocaleDateString('en-IN', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.modalActions}>
                <Button mode="outlined" onPress={handleCancel} style={styles.cancelButton}>
                  Cancel
                </Button>
                <Button mode="contained" onPress={() => handleDateSelect(selectedDate)} style={styles.confirmButton}>
                  Select
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  dateList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  dateOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedDateOption: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
    borderWidth: 1,
  },
  dateOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedDateOptionText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
});

