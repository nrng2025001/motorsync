import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { GiftedChat, IMessage, User } from 'react-native-gifted-chat';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Button } from 'react-native-paper';

import { useAuth } from '../../context/AuthContext';
import { theme, spacing } from '../../utils/theme';

/**
 * AI Assistant responses based on automotive context
 */
const aiResponses = [
  "I can help you with customer enquiries, vehicle information, pricing, and quotations. What would you like to know?",
  "Based on current market trends, the Toyota Camry and Honda Accord are popular choices for family sedans. Would you like specific pricing information?",
  "For luxury vehicles, customers often prioritize features like premium sound systems, leather seating, and advanced safety features. I can help you highlight these in your presentations.",
  "The average conversion rate for automotive sales is around 65-75%. Your current performance looks good! Would you like tips to improve further?",
  "For financing options, most customers prefer 60-72 month terms with competitive APR rates. I can help you calculate monthly payments.",
  "Customer satisfaction typically increases when response times are under 2 hours. Your current average response time is excellent!",
  "Electric vehicles are gaining popularity. Consider highlighting charging infrastructure, tax incentives, and long-term savings in your pitches.",
  "For trade-in evaluations, factors like mileage, condition, service history, and market demand are crucial. I can help you assess these factors.",
];

/**
 * Quick action suggestions for automotive context
 */
const quickActions = [
  { id: 1, text: "Vehicle pricing information", action: "pricing" },
  { id: 2, text: "Customer objection handling", action: "objections" },
  { id: 3, text: "Financing options", action: "financing" },
  { id: 4, text: "Trade-in evaluation", action: "tradein" },
  { id: 5, text: "Sales performance tips", action: "performance" },
  { id: 6, text: "Market trends analysis", action: "trends" },
];

/**
 * AI Assistant Screen Component
 * Provides a chat interface with AI assistance for automotive sales
 */
export function AIAssistantScreen(): React.JSX.Element {
  const { state } = useAuth();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // AI Assistant user object
  const aiUser: User = {
    _id: 'ai-assistant',
    name: 'AI Assistant',
    avatar: undefined, // You could add an AI avatar here
  };

  // Current user object
  const currentUser: User = {
    _id: state.user?.id || 'user',
    name: state.user?.name || 'User',
  };

  useEffect(() => {
    // Initialize with welcome message
    setMessages([
      {
        _id: Math.random().toString(),
        text: `Hello ${state.user?.name || 'there'}! I'm your AI assistant for MotorSync. I can help you with customer enquiries, vehicle information, pricing strategies, and sales techniques. How can I assist you today?`,
        createdAt: new Date(),
        user: aiUser,
      },
    ]);
  }, [state.user?.name]);

  /**
   * Handle sending messages
   */
  const onSend = useCallback((newMessages: IMessage[] = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
    
    // Simulate AI response
    setIsTyping(true);
    setTimeout(() => {
      const aiResponse: IMessage = {
        _id: Math.random().toString(),
        text: getAIResponse(newMessages[0].text),
        createdAt: new Date(),
        user: aiUser,
      };
      setMessages(previousMessages => GiftedChat.append(previousMessages, [aiResponse]));
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  }, []);

  /**
   * Generate AI response based on user input
   * In a real app, this would call an actual AI service like OpenAI or Gemini
   */
  const getAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('price') || message.includes('cost') || message.includes('pricing')) {
      return "For pricing information, I recommend considering factors like market demand, competitor pricing, and customer budget. Would you like me to help you prepare a competitive pricing strategy for a specific vehicle?";
    }
    
    if (message.includes('finance') || message.includes('loan') || message.includes('payment')) {
      return "For financing, most customers prefer monthly payments between $300-$600. I can help you calculate payment options with different terms and APR rates. What's the vehicle price you're working with?";
    }
    
    if (message.includes('objection') || message.includes('concern') || message.includes('hesitat')) {
      return "Common customer objections include price concerns, financing worries, and feature comparisons. The key is to listen actively, acknowledge their concerns, and provide value-focused solutions. What specific objection are you facing?";
    }
    
    if (message.includes('trade') || message.includes('exchange')) {
      return "For trade-in evaluations, check the vehicle's mileage, condition, service history, and current market value. Tools like KBB and Edmunds provide good baseline values. What vehicle are you evaluating?";
    }
    
    if (message.includes('performance') || message.includes('sales') || message.includes('conversion')) {
      return "To improve sales performance, focus on building rapport, understanding customer needs, presenting value over price, and following up consistently. Your current metrics look strong! Any specific area you'd like to improve?";
    }
    
    if (message.includes('electric') || message.includes('ev') || message.includes('hybrid')) {
      return "Electric and hybrid vehicles are trending upward. Key selling points include lower operating costs, environmental benefits, tax incentives, and improving charging infrastructure. Would you like specific talking points for EVs?";
    }
    
    // Return a random general response
    return aiResponses[Math.floor(Math.random() * aiResponses.length)];
  };

  /**
   * Handle quick action press
   */
  const handleQuickAction = (action: string) => {
    let message = '';
    
    switch (action) {
      case 'pricing':
        message = 'Can you help me with vehicle pricing strategies?';
        break;
      case 'objections':
        message = 'How should I handle customer objections?';
        break;
      case 'financing':
        message = 'What financing options should I offer customers?';
        break;
      case 'tradein':
        message = 'How do I evaluate trade-in vehicles?';
        break;
      case 'performance':
        message = 'Can you give me tips to improve my sales performance?';
        break;
      case 'trends':
        message = 'What are the current automotive market trends?';
        break;
      default:
        message = 'Can you help me with automotive sales?';
    }
    
    const quickMessage: IMessage = {
      _id: Math.random().toString(),
      text: message,
      createdAt: new Date(),
      user: currentUser,
    };
    
    onSend([quickMessage]);
  };

  /**
   * Render quick actions if no messages from user yet
   */
  const renderQuickActions = () => {
    const userMessages = messages.filter(m => m.user._id !== 'ai-assistant');
    
    if (userMessages.length > 0) {
      return null;
    }
    
    return (
      <Card style={styles.quickActionsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.quickActionsTitle}>
            Quick Actions
          </Text>
          <Text variant="bodySmall" style={styles.quickActionsSubtitle}>
            Tap on any topic to get started
          </Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <Button
                key={action.id}
                mode="outlined"
                compact
                onPress={() => handleQuickAction(action.action)}
                style={styles.quickActionButton}
                contentStyle={styles.quickActionContent}
              >
                {action.text}
              </Button>
            ))}
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={currentUser}
        isTyping={isTyping}
        placeholder="Ask me anything about MotorSync sales..."
        showUserAvatar={false}
        renderChatEmpty={() => (
          <View style={styles.emptyContainer}>
            {renderQuickActions()}
          </View>
        )}
        messagesContainerStyle={styles.messagesContainer}
        textInputStyle={styles.textInput}
        theme={{
          primaryColor: theme.colors.primary,
          secondaryColor: theme.colors.primaryContainer,
          backgroundColor: theme.colors.background,
          textPrimaryColor: theme.colors.onSurface,
          textSecondaryColor: theme.colors.onSurfaceVariant,
        }}
        bottomOffset={0}
        minInputToolbarHeight={60}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.md,
    transform: [{ scaleY: -1 }], // GiftedChat inverts the container
  },
  messagesContainer: {
    backgroundColor: theme.colors.background,
  },
  textInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.sm,
    color: theme.colors.onSurface,
  },
  quickActionsCard: {
    margin: spacing.md,
    elevation: 2,
  },
  quickActionsTitle: {
    color: theme.colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  quickActionsSubtitle: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickActionButton: {
    marginBottom: spacing.sm,
    borderRadius: 20,
  },
  quickActionContent: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
});
