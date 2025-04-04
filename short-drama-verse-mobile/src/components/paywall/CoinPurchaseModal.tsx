/**
 * Coin Purchase Modal Component
 * 
 * Modal dialog for purchasing content with coins
 * or buying more coins if the user doesn't have enough.
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
import { coinService } from '@/services/coin';
import { analyticsService } from '@/services/analytics';
import { CoinPackage } from '@/types/monetization';
import { AnalyticsEventType } from '@/services/analytics';

interface CoinPurchaseModalProps {
  isVisible: boolean;
  onClose: () => void;
  contentId: number;
  contentType: 'episode' | 'series' | 'movie';
  contentTitle: string;
  requiredCoins: number;
  onPurchaseComplete: () => void;
  thumbnailUrl?: string;
}

const CoinPurchaseModal: React.FC<CoinPurchaseModalProps> = ({
  isVisible,
  onClose,
  contentId,
  contentType,
  contentTitle,
  requiredCoins,
  onPurchaseComplete,
  thumbnailUrl
}) => {
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [coinPackages, setCoinPackages] = useState<CoinPackage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);
  const [mode, setMode] = useState<'check' | 'purchase'>('check');

  // Fetch coin balance and packages when modal opens
  useEffect(() => {
    if (isVisible) {
      loadData();
    }
  }, [isVisible]);

  // Load user's coin balance and available packages
  const loadData = async () => {
    try {
      setIsLoading(true);
      const balance = await coinService.getCoinBalance();
      setCurrentBalance(balance);
      
      // If user doesn't have enough coins, load available packages
      if (balance < requiredCoins) {
        const packages = await coinService.getCoinPackages();
        setCoinPackages(packages);
      }
      
      setIsLoading(false);
      
      // Determine which mode to show
      setMode(balance >= requiredCoins ? 'check' : 'purchase');
    } catch (error) {
      console.error('Error loading coin data:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to load coin information. Please try again.');
    }
  };

  // Purchase content with coins
  const purchaseContent = async () => {
    try {
      setIsPurchasing(true);
      
      // Call the coin service to purchase the content
      const success = await coinService.purchaseContent(
        contentId,
        contentType,
        requiredCoins
      );
      
      setIsPurchasing(false);
      
      if (success) {
        // Track success in analytics
        analyticsService.trackEvent(AnalyticsEventType.SPEND_COINS, {
          contentId,
          contentType,
          coinAmount: requiredCoins,
          contentTitle
        });
        
        // Update balance
        const newBalance = await coinService.getCoinBalance();
        setCurrentBalance(newBalance);
        
        // Notify parent component
        onPurchaseComplete();
        
        // Close the modal
        onClose();
      } else {
        Alert.alert('Purchase Failed', 'Unable to complete the purchase. Please try again.');
      }
    } catch (error) {
      console.error('Error purchasing content:', error);
      setIsPurchasing(false);
      Alert.alert('Error', 'Purchase failed. Please try again.');
    }
  };

  // Buy a coin package
  const buyCoins = async () => {
    if (!selectedPackage) {
      Alert.alert('Please Select', 'Please select a coin package first.');
      return;
    }
    
    try {
      setIsPurchasing(true);
      
      // In a real app, this would integrate with a payment provider SDK
      // For now, we'll simulate the purchase process
      
      Alert.alert(
        'Coin Purchase',
        `Would you like to purchase ${selectedPackage.coinAmount} coins for ${selectedPackage.price} ${selectedPackage.currency}?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setIsPurchasing(false)
          },
          {
            text: 'Buy',
            onPress: async () => {
              try {
                // This would be replaced with actual payment processing
                // For example: const transaction = await coinService.purchaseCoinPackage(selectedPackage.id, paymentMethodId);
                
                // Simulate successful purchase
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Update balance after purchase
                const newBalance = currentBalance + selectedPackage.coinAmount;
                setCurrentBalance(newBalance);
                
                // Change mode if we now have enough coins
                if (newBalance >= requiredCoins) {
                  setMode('check');
                }
                
                setIsPurchasing(false);
                Alert.alert('Success', `${selectedPackage.coinAmount} coins added to your account!`);
              } catch (error) {
                console.error('Error buying coins:', error);
                setIsPurchasing(false);
                Alert.alert('Purchase Failed', 'Unable to complete the coin purchase. Please try again.');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error initiating coin purchase:', error);
      setIsPurchasing(false);
      Alert.alert('Error', 'Failed to initiate purchase. Please try again.');
    }
  };

  // Render each coin package option
  const renderCoinPackage = (pkg: CoinPackage) => {
    const isSelected = selectedPackage && selectedPackage.id === pkg.id;
    
    return (
      <TouchableOpacity
        key={pkg.id}
        style={[styles.packageItem, isSelected && styles.selectedPackage]}
        onPress={() => setSelectedPackage(pkg)}
      >
        <View style={styles.packageHeader}>
          <Text style={styles.packageName}>{pkg.name}</Text>
          {pkg.isPopular && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>POPULAR</Text>
            </View>
          )}
        </View>
        
        <View style={styles.coinAmount}>
          <Ionicons name="ios-coin" size={24} color="#FFD700" />
          <Text style={styles.coinAmountText}>{pkg.coinAmount}</Text>
          {pkg.bonusCoins > 0 && (
            <Text style={styles.bonusText}>+{pkg.bonusCoins} BONUS</Text>
          )}
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {pkg.price} {pkg.currency}
          </Text>
          {pkg.discount > 0 && (
            <Text style={styles.discountText}>{pkg.discount}% OFF</Text>
          )}
        </View>
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
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <>
              <View style={styles.contentInfo}>
                {thumbnailUrl && (
                  <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />
                )}
                <View style={styles.contentDetails}>
                  <Text style={styles.contentType}>
                    {contentType === 'episode' ? 'Episode' : contentType === 'series' ? 'Series' : 'Movie'}
                  </Text>
                  <Text style={styles.contentTitle} numberOfLines={2}>
                    {contentTitle}
                  </Text>
                </View>
              </View>
              
              <View style={styles.balanceContainer}>
                <Ionicons name="ios-wallet" size={20} color="#0000ff" />
                <Text style={styles.balanceText}>Your Balance: </Text>
                <Ionicons name="ios-coin" size={20} color="#FFD700" />
                <Text style={styles.balanceAmount}>{currentBalance}</Text>
              </View>
              
              {mode === 'check' ? (
                <View style={styles.confirmContainer}>
                  <Text style={styles.confirmText}>
                    This content costs <Text style={styles.costHighlight}>{requiredCoins} coins</Text>.
                    Would you like to unlock it?
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.purchaseButton}
                    onPress={purchaseContent}
                    disabled={isPurchasing}
                  >
                    {isPurchasing ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.purchaseButtonText}>
                        Unlock Now ({requiredCoins} coins)
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.purchaseCoinsContainer}>
                  <Text style={styles.notEnoughText}>
                    You need <Text style={styles.costHighlight}>{requiredCoins - currentBalance} more coins</Text> to unlock this content.
                  </Text>
                  
                  <Text style={styles.selectPackageText}>Select a Coin Package:</Text>
                  
                  <ScrollView style={styles.packagesContainer}>
                    {coinPackages.map(renderCoinPackage)}
                  </ScrollView>
                  
                  <TouchableOpacity
                    style={styles.purchaseButton}
                    onPress={buyCoins}
                    disabled={!selectedPackage || isPurchasing}
                  >
                    {isPurchasing ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.purchaseButtonText}>
                        Buy Coins
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
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
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  contentInfo: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
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
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  balanceText: {
    fontSize: 16,
    marginLeft: 5,
    marginRight: 5,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  confirmContainer: {
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  costHighlight: {
    fontWeight: 'bold',
    color: '#0000ff',
  },
  purchaseButton: {
    backgroundColor: '#0000ff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  purchaseCoinsContainer: {
    flex: 1,
  },
  notEnoughText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  selectPackageText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  packagesContainer: {
    marginBottom: 20,
    maxHeight: 300,
  },
  packageItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  selectedPackage: {
    borderColor: '#0000ff',
    backgroundColor: 'rgba(0, 0, 255, 0.05)',
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  packageName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  popularBadge: {
    backgroundColor: '#FF6B00',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  popularText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  coinAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  coinAmountText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  bonusText: {
    marginLeft: 10,
    fontSize: 12,
    color: 'green',
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  discountText: {
    marginLeft: 10,
    fontSize: 14,
    color: 'red',
    fontWeight: 'bold',
  },
});

export default CoinPurchaseModal;