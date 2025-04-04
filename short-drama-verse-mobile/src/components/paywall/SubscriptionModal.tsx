/**
 * Subscription Modal Component
 * 
 * Modal dialog for showing subscription options
 * when a user tries to access premium content.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { subscriptionService } from '@/services/subscription';
import { analyticsService } from '@/services/analytics';
import { SubscriptionPlan } from '@/types/monetization';
import { AnalyticsEventType } from '@/services/analytics';

interface SubscriptionModalProps {
  isVisible: boolean;
  onClose: () => void;
  contentTitle?: string;
  thumbnailUrl?: string;
  onSubscribe?: () => void;
  requiredSubscriptionLevel?: string;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isVisible,
  onClose,
  contentTitle,
  thumbnailUrl,
  onSubscribe,
  requiredSubscriptionLevel
}) => {
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [userHasSubscription, setUserHasSubscription] = useState<boolean>(false);
  
  // Load subscription plans when modal is opened
  useEffect(() => {
    if (isVisible) {
      loadSubscriptionData();
    }
  }, [isVisible]);
  
  // Load subscription data
  const loadSubscriptionData = async () => {
    try {
      setIsLoading(true);
      
      // Check if user already has a subscription
      const hasAccess = await subscriptionService.hasPremiumAccess();
      setUserHasSubscription(hasAccess);
      
      // Get available plans
      const plans = await subscriptionService.getSubscriptionPlans();
      setSubscriptionPlans(plans);
      
      // Auto-select the recommended plan or required plan
      if (plans.length > 0) {
        if (requiredSubscriptionLevel) {
          const requiredPlan = plans.find(p => p.name.toLowerCase() === requiredSubscriptionLevel.toLowerCase());
          if (requiredPlan) {
            setSelectedPlan(requiredPlan);
          } else {
            // Default to the first plan if required plan not found
            setSelectedPlan(plans[0]);
          }
        } else {
          // Find the popular plan or default to first plan
          const popularPlan = plans.find(p => p.popularityIndex > 0);
          setSelectedPlan(popularPlan || plans[0]);
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading subscription plans:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to load subscription plans. Please try again.');
    }
  };
  
  // Handle subscription purchase
  const handleSubscribe = async () => {
    if (!selectedPlan) {
      Alert.alert('Please Select', 'Please select a subscription plan first.');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // In a real app, this would integrate with a payment provider SDK
      // For now, we'll simulate the subscription process
      
      Alert.alert(
        'Subscribe',
        `Would you like to subscribe to ${selectedPlan.name} for ${selectedPlan.price} ${selectedPlan.currency}/${selectedPlan.interval}?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setIsProcessing(false)
          },
          {
            text: 'Subscribe',
            onPress: async () => {
              try {
                // This would be replaced with actual payment processing
                // For example: const subscription = await subscriptionService.subscribeToPlan(selectedPlan.id, paymentMethodId);
                
                // Simulate successful subscription
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Track subscription event
                analyticsService.trackEvent(AnalyticsEventType.PURCHASE_SUBSCRIPTION, {
                  planId: selectedPlan.id,
                  planName: selectedPlan.name,
                  price: selectedPlan.price,
                  currency: selectedPlan.currency,
                  interval: selectedPlan.interval
                });
                
                setIsProcessing(false);
                setUserHasSubscription(true);
                
                Alert.alert(
                  'Subscribed!',
                  `You've successfully subscribed to ${selectedPlan.name}!`,
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        // Notify parent if needed
                        if (onSubscribe) {
                          onSubscribe();
                        }
                        
                        // Close the modal after a short delay
                        setTimeout(onClose, 500);
                      }
                    }
                  ]
                );
              } catch (error) {
                console.error('Error processing subscription:', error);
                setIsProcessing(false);
                Alert.alert('Subscription Failed', 'Unable to complete the subscription. Please try again.');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error initiating subscription:', error);
      setIsProcessing(false);
      Alert.alert('Error', 'Failed to initiate subscription. Please try again.');
    }
  };
  
  // Render subscription plan item
  const renderSubscriptionPlan = (plan: SubscriptionPlan) => {
    const isSelected = selectedPlan && selectedPlan.id === plan.id;
    const isRequired = requiredSubscriptionLevel && 
                      plan.name.toLowerCase() === requiredSubscriptionLevel.toLowerCase();
    
    return (
      <TouchableOpacity
        key={plan.id}
        style={[
          styles.planItem,
          isSelected && styles.selectedPlan,
          isRequired && styles.requiredPlan
        ]}
        onPress={() => setSelectedPlan(plan)}
      >
        <View style={styles.planHeader}>
          <Text style={styles.planName}>{plan.name}</Text>
          {plan.popularityIndex > 0 && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>POPULAR</Text>
            </View>
          )}
          {isRequired && (
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredText}>REQUIRED</Text>
            </View>
          )}
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.priceAmount}>
            {plan.price} {plan.currency}
          </Text>
          <Text style={styles.pricePeriod}>
            /{plan.interval}
          </Text>
          
          {plan.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>SAVE {plan.discount}%</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.planDescription}>{plan.description}</Text>
        
        <View style={styles.featuresContainer}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="ios-checkmark-circle" size={20} color="#0000ff" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
        
        {plan.trialDays > 0 && (
          <View style={styles.trialBadge}>
            <Text style={styles.trialText}>
              {plan.trialDays} DAYS FREE TRIAL
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="ios-close" size={24} color="#000" />
          </TouchableOpacity>
          
          <Text style={styles.modalTitle}>
            {userHasSubscription ? 'Your Subscription' : 'Subscribe to Premium'}
          </Text>
          
          {contentTitle && (
            <View style={styles.contentInfo}>
              {thumbnailUrl && (
                <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />
              )}
              <View style={styles.contentDetails}>
                <Text style={styles.contentType}>Premium Content</Text>
                <Text style={styles.contentTitle} numberOfLines={2}>
                  {contentTitle}
                </Text>
              </View>
            </View>
          )}
          
          {userHasSubscription ? (
            <View style={styles.subscribedContainer}>
              <Ionicons name="ios-checkmark-circle" size={60} color="#4CAF50" />
              <Text style={styles.subscribedText}>
                You're already subscribed!
              </Text>
              <Text style={styles.subscribedSubtext}>
                You have access to all premium content.
              </Text>
              <TouchableOpacity
                style={styles.closeSubscribedButton}
                onPress={onClose}
              >
                <Text style={styles.closeSubscribedButtonText}>
                  Continue Watching
                </Text>
              </TouchableOpacity>
            </View>
          ) : isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
              <Text style={styles.loadingText}>Loading subscription plans...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.subscriptionMessage}>
                {requiredSubscriptionLevel 
                  ? `This content requires a ${requiredSubscriptionLevel} subscription.`
                  : 'Subscribe to access premium content and exclusive features.'}
              </Text>
              
              <ScrollView style={styles.plansContainer}>
                {subscriptionPlans.map(renderSubscriptionPlan)}
              </ScrollView>
              
              <TouchableOpacity
                style={styles.subscribeButton}
                onPress={handleSubscribe}
                disabled={!selectedPlan || isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.subscribeButtonText}>
                    {selectedPlan?.trialDays 
                      ? `Start ${selectedPlan.trialDays}-Day Free Trial`
                      : 'Subscribe Now'}
                  </Text>
                )}
              </TouchableOpacity>
              
              <Text style={styles.termsText}>
                By subscribing, you agree to our Terms of Service and Privacy Policy.
                Subscriptions automatically renew unless canceled.
              </Text>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    maxHeight: '90%',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    padding: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  contentInfo: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 15,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  contentDetails: {
    flex: 1,
  },
  contentType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  subscriptionMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  plansContainer: {
    maxHeight: 400,
    marginBottom: 20,
  },
  planItem: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  selectedPlan: {
    borderColor: '#0000ff',
    backgroundColor: 'rgba(0, 0, 255, 0.05)',
    borderWidth: 2,
  },
  requiredPlan: {
    borderColor: '#FF6B00',
    borderWidth: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  popularBadge: {
    backgroundColor: '#4CAF50',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 10,
  },
  popularText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  requiredBadge: {
    backgroundColor: '#FF6B00',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 10,
  },
  requiredText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  pricePeriod: {
    fontSize: 16,
    color: '#666',
    marginLeft: 2,
  },
  discountBadge: {
    backgroundColor: 'red',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 10,
  },
  discountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  planDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
  },
  featuresContainer: {
    marginBottom: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 10,
    color: '#333',
  },
  trialBadge: {
    backgroundColor: '#0000ff',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  trialText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  subscribeButton: {
    backgroundColor: '#0000ff',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  subscribeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  subscribedContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  subscribedText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  subscribedSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
  },
  closeSubscribedButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  closeSubscribedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SubscriptionModal;