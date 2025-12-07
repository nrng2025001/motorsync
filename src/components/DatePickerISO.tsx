/**
 * DatePickerISO Component
 * Calendar picker that returns ISO-8601 formatted dates for API compatibility
 * Uses react-native-paper-dates Calendar component in a custom bottom sheet modal
 * Opens as a bottom sheet (not full screen) for better UX
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Platform, Dimensions } from 'react-native';
import { TextInput, HelperText, Portal, Button, Text } from 'react-native-paper';
import { Calendar } from 'react-native-paper-dates';
import { formatDateForAPI } from '../services/api.config';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  );

  // Update selectedDate when value prop changes
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
      }
    } else {
      setSelectedDate(undefined);
    }
  }, [value]);

  const formatDisplayDate = (isoString?: string): string => {
    if (!isoString) return 'Select date';
    
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return 'Select date';
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

  const onDismiss = () => {
    setShowPicker(false);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleConfirm = () => {
    if (selectedDate) {
      const isoDate = formatDateForAPI(selectedDate);
      onChange(isoDate);
      setShowPicker(false);
    }
  };

  // Set default minimum date to today if not provided
  const minDate = minimumDate || new Date();
  
  // Set default maximum date to 1 year from now if not provided
  const maxDate = maximumDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1));

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

      <Portal>
        <Modal
          visible={showPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={onDismiss}
        >
          <View style={styles.modalOverlay} onTouchEnd={onDismiss}>
            <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text variant="titleLarge" style={styles.modalTitle}>
                  Select Date
                </Text>
                <Button onPress={onDismiss} textColor="#666" compact>
                  Cancel
                </Button>
              </View>
              
              {/* Calendar */}
              <View style={styles.calendarWrapper}>
                <Calendar
                  locale="en"
                  mode="single"
                  date={selectedDate}
                  onSelect={handleDateSelect}
                  validRange={{
                    startDate: minDate,
                    endDate: maxDate,
                  }}
                  startYear={minDate.getFullYear()}
                  endYear={maxDate.getFullYear()}
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={onDismiss}
                  style={styles.actionButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleConfirm}
                  disabled={!selectedDate}
                  style={styles.actionButton}
                >
                  Select
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      </Portal>
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
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.75, // 75% of screen height, not full screen
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontWeight: '600',
    color: '#1F2937',
  },
  calendarWrapper: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    minHeight: 350,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flex: 1,
  },
});

