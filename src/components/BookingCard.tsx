/**
 * Booking Card Component
 * Displays booking information in a card format
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip, Button } from 'react-native-paper';
import { Booking, BookingStatus } from '../services/types';

interface BookingCardProps {
  booking: Booking;
  onPress?: () => void;
  onUpdate?: () => void;
  showActions?: boolean;
}

export function BookingCard({
  booking,
  onPress,
  onUpdate,
  showActions = true,
}: BookingCardProps): React.JSX.Element {
  const getStatusColor = (status: BookingStatus): string => {
    switch (status) {
      case BookingStatus.PENDING:
        return '#F59E0B';
      case BookingStatus.ASSIGNED:
        return '#3B82F6';
      case BookingStatus.CONFIRMED:
        return '#10B981';
      case BookingStatus.DELIVERED:
        return '#8B5CF6';
      case BookingStatus.CANCELLED:
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: BookingStatus): string => {
    switch (status) {
      case BookingStatus.PENDING:
        return 'clock-outline';
      case BookingStatus.ASSIGNED:
        return 'account-arrow-right';
      case BookingStatus.CONFIRMED:
        return 'check-circle';
      case BookingStatus.DELIVERED:
        return 'truck-check';
      case BookingStatus.CANCELLED:
        return 'close-circle';
      default:
        return 'circle';
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const isOverdue = (): boolean => {
    if (!booking.expectedDeliveryDate) return false;
    const deliveryDate = new Date(booking.expectedDeliveryDate);
    const today = new Date();
    return (
      deliveryDate < today &&
      booking.status !== BookingStatus.DELIVERED &&
      booking.status !== BookingStatus.CANCELLED
    );
  };

  return (
    <Card style={[styles.card, isOverdue() && styles.overdueCard]} onPress={onPress}>
      <Card.Content style={styles.content}>
        {/* Header with status */}
        <View style={styles.header}>
          <View style={styles.customerInfo}>
            <Text variant="titleMedium" style={styles.customerName}>
              {booking.customerName}
            </Text>
            <Text variant="bodySmall" style={styles.contact}>
              📞 {booking.customerPhone}
            </Text>
            {booking.customerEmail && (
              <Text variant="bodySmall" style={styles.contact}>
                ✉️ {booking.customerEmail}
              </Text>
            )}
          </View>
          <Chip
            icon={getStatusIcon(booking.status)}
            style={[styles.statusChip, { backgroundColor: getStatusColor(booking.status) }]}
            textStyle={styles.statusText}
            compact
          >
            {booking.status}
          </Chip>
        </View>

        {/* Vehicle Information */}
        <View style={styles.vehicleInfo}>
          <Text variant="bodyMedium" style={styles.variant}>
            🚗 {booking.variant}
          </Text>
          {booking.color && (
            <Text variant="bodySmall" style={styles.details}>
              🎨 {booking.color}
            </Text>
          )}
          {booking.fuelType && booking.transmission && (
            <Text variant="bodySmall" style={styles.details}>
              ⚡ {booking.fuelType} • {booking.transmission}
            </Text>
          )}
        </View>

        {/* Dates Section */}
        <View style={styles.datesSection}>
          <View style={styles.dateItem}>
            <Text variant="bodySmall" style={styles.dateLabel}>
              Booking Date:
            </Text>
            <Text variant="bodySmall" style={styles.dateValue}>
              {formatDate(booking.bookingDate)}
            </Text>
          </View>
          {booking.expectedDeliveryDate && (
            <View style={styles.dateItem}>
              <Text variant="bodySmall" style={styles.dateLabel}>
                Delivery Date:
              </Text>
              <Text
                variant="bodySmall"
                style={[styles.dateValue, isOverdue() && styles.overdueDate]}
              >
                {formatDate(booking.expectedDeliveryDate)}
                {isOverdue() && ' ⚠️'}
              </Text>
            </View>
          )}
        </View>

        {/* Finance Information */}
        {booking.financeRequired && (
          <View style={styles.financeInfo}>
            <Text variant="bodySmall" style={styles.financeLabel}>
              💳 Finance: {booking.financerName || 'Required'}
            </Text>
            {booking.fileLoginDate && (
              <Text variant="bodySmall" style={styles.financeDetail}>
                File Login: {formatDate(booking.fileLoginDate)}
              </Text>
            )}
            {booking.approvalDate && (
              <Text variant="bodySmall" style={styles.financeDetail}>
                Approval: {formatDate(booking.approvalDate)}
              </Text>
            )}
          </View>
        )}

        {/* Stock & RTO Information */}
        <View style={styles.additionalInfo}>
          {booking.stockAvailability && (
            <Chip
              icon={booking.stockAvailability === 'VEHICLE_AVAILABLE' ? 'check' : 'alert'}
              style={[
                styles.infoChip,
                {
                  backgroundColor:
                    booking.stockAvailability === 'VEHICLE_AVAILABLE' ? '#D1FAE5' : '#FEE2E2',
                },
              ]}
              textStyle={{
                color: booking.stockAvailability === 'VEHICLE_AVAILABLE' ? '#065F46' : '#991B1B',
              }}
              compact
            >
              {booking.stockAvailability === 'VEHICLE_AVAILABLE' ? 'In Stock' : 'VNA'}
            </Chip>
          )}
          {booking.rtoDate && (
            <Text variant="bodySmall" style={styles.rtoText}>
              🏛️ RTO: {formatDate(booking.rtoDate)}
            </Text>
          )}
        </View>

        {/* Advisor Remarks */}
        {booking.advisorRemarks && (
          <View style={styles.remarksContainer}>
            <Text variant="bodySmall" style={styles.remarksLabel}>
              Your Remarks:
            </Text>
            <Text variant="bodySmall" style={styles.remarks}>
              {booking.advisorRemarks}
            </Text>
          </View>
        )}

        {/* Source Badge */}
        {booking.source && (
          <Chip 
            icon={booking.source === 'MOBILE' ? 'cellphone' : 'file-import'} 
            style={[
              styles.sourceChip,
              {
                backgroundColor: booking.source === 'MOBILE' ? '#E0F2FE' : '#F3E8FF',
              }
            ]} 
            textStyle={[
              styles.sourceText,
              {
                color: booking.source === 'MOBILE' ? '#0369A1' : '#7C3AED',
              }
            ]} 
            compact
          >
            {booking.source === 'MOBILE' ? '📱 Mobile App' : '📊 Bulk Import'}
          </Chip>
        )}

        {/* Action Buttons */}
        {showActions && onUpdate && (
          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={onUpdate}
              icon="pencil"
              style={styles.updateButton}
              compact
            >
              Update Booking
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    elevation: 3,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  content: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  contact: {
    color: '#6B7280',
    marginBottom: 2,
  },
  statusChip: {
    marginLeft: 8,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 10,
  },
  vehicleInfo: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  variant: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#1E40AF',
    fontSize: 16,
  },
  details: {
    color: '#4B5563',
    marginBottom: 2,
  },
  datesSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    color: '#6B7280',
    marginBottom: 2,
  },
  dateValue: {
    fontWeight: '600',
    color: '#111827',
  },
  overdueDate: {
    color: '#DC2626',
  },
  financeInfo: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
  },
  financeLabel: {
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  financeDetail: {
    color: '#78350F',
    marginBottom: 2,
  },
  additionalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  infoChip: {
    marginRight: 8,
  },
  rtoText: {
    color: '#6B7280',
  },
  remarksContainer: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#DBEAFE',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  remarksLabel: {
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  remarks: {
    color: '#1E3A8A',
  },
  sourceChip: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    backgroundColor: '#E5E7EB',
  },
  sourceText: {
    fontSize: 10,
    color: '#374151',
  },
  actions: {
    marginTop: 8,
  },
  updateButton: {
    width: '100%',
  },
});

