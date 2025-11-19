/**
 * Enquiry Card Component
 * Displays enquiry information in a card format
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, IconButton, Button } from 'react-native-paper';
import { Enquiry, EnquiryCategory } from '../services/types';
import { formatEnquirySource } from '../utils/formatting';

interface EnquiryCardProps {
  enquiry: Enquiry;
  onPress?: () => void;
  onEdit?: () => void;
  onConvertToBooking?: () => void;
  showActions?: boolean;
  showCreatorInfo?: boolean;
  userRole?: string;
}

export function EnquiryCard({
  enquiry,
  onPress,
  onEdit,
  onConvertToBooking,
  showActions = true,
  showCreatorInfo = false,
  userRole,
}: EnquiryCardProps): React.JSX.Element {
  const getCategoryColor = (category: EnquiryCategory): string => {
    switch (category) {
      case EnquiryCategory.HOT:
        return '#EF4444';
      case EnquiryCategory.LOST:
        return '#6B7280';
      case EnquiryCategory.BOOKED:
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getCategoryIcon = (category: EnquiryCategory): string => {
    switch (category) {
      case EnquiryCategory.HOT:
        return 'fire';
      case EnquiryCategory.LOST:
        return 'close-circle';
      case EnquiryCategory.BOOKED:
        return 'check-circle';
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

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        {/* Header with category indicator and badges */}
        <View style={styles.header}>
          <View style={styles.customerInfo}>
            <View style={styles.customerNameRow}>
              <Text style={[styles.categoryIndicator, { color: getCategoryColor(enquiry.category) }]}>
                🔥
              </Text>
              <Text variant="titleMedium" style={styles.customerName}>
                {enquiry.customerName}
              </Text>
            </View>
            <View style={styles.badgeRow}>
              <View style={[styles.statusBadge, { backgroundColor: getCategoryColor(enquiry.category) === '#EF4444' ? '#FEF2F2' : '#F0FDF4' }]}>
                <Text style={[styles.statusBadgeText, { color: getCategoryColor(enquiry.category) }]}>
                  🔥 HOT
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.statusBadgeText, { color: '#92400E' }]}>
                  OPEN
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contact and Vehicle Information */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📞</Text>
            <Text style={styles.detailText}>{enquiry.customerContact}</Text>
          </View>
          {enquiry.customerEmail && (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>✉️</Text>
              <Text style={styles.detailText}>{enquiry.customerEmail}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🚗</Text>
            <Text style={styles.detailText}>
              {enquiry.model} - {enquiry.variant || 'Standard'} ({enquiry.color || 'Not Specified'})
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🗓️</Text>
            <Text style={styles.detailText}>Created: {formatDate(enquiry.createdAt)}</Text>
          </View>
          {enquiry.expectedBookingDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>⏰</Text>
              <Text style={styles.detailText}>Expected Booking: {formatDate(enquiry.expectedBookingDate)}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🔗</Text>
            <Text style={styles.detailText}>
              Source: {formatEnquirySource(enquiry.source)}
            </Text>
          </View>
          {enquiry.location && (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📍</Text>
              <Text style={styles.detailText}>Location: {enquiry.location}</Text>
            </View>
          )}
          {showCreatorInfo && enquiry.createdBy && (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>👤</Text>
              <Text style={styles.detailText}>
                Created by: {enquiry.createdBy.name} ({enquiry.createdBy.email})
              </Text>
            </View>
          )}
          {showCreatorInfo && enquiry.assignedTo && (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>🎯</Text>
              <Text style={styles.detailText}>
                Assigned to: {enquiry.assignedTo.name} ({enquiry.assignedTo.email})
              </Text>
            </View>
          )}
        </View>

        {/* Footer with timestamp and action buttons */}
        <View style={styles.footer}>
          <Text style={styles.timestamp}>
            Updated: {formatDate(enquiry.updatedAt || enquiry.createdAt)}
          </Text>
          <View style={styles.actionButtons}>
            {enquiry.category === EnquiryCategory.HOT && onConvertToBooking && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.convertButton]} 
                onPress={onConvertToBooking}
              >
                <Text style={styles.convertButtonText}>Convert to Booking</Text>
              </TouchableOpacity>
            )}
            {onEdit && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.editButton]} 
                onPress={onEdit}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.actionButton, styles.viewButton]} onPress={onPress}>
              <Text style={styles.viewButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderTopWidth: 4,
    borderTopColor: '#EF4444',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  customerInfo: {
    flex: 1,
  },
  customerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIndicator: {
    fontSize: 20,
    marginRight: 10,
  },
  customerName: {
    fontWeight: '800',
    fontSize: 20,
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  detailText: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
    fontWeight: '500',
    lineHeight: 20,
  },
  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  timestamp: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  convertButton: {
    backgroundColor: '#10B981',
  },
  convertButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  editButton: {
    backgroundColor: '#F59E0B',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  viewButton: {
    backgroundColor: '#3B82F6',
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
});

