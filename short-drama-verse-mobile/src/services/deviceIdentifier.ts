/**
 * Device Identifier Service
 * 
 * Provides device-specific identification for user tracking without requiring login.
 * Used by analytics and anonymous user services.
 */
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { MMKV } from 'react-native-mmkv';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

// Storage key for device ID
const DEVICE_ID_KEY = 'device_identifier';
const ANONYMOUS_ID_KEY = 'anonymous_user_id';

// Storage for persistent data
const storage = new MMKV();

/**
 * Device information interface
 */
export interface DeviceInformation {
  uniqueId: string;
  model: string;
  platform: string;
  osVersion: string;
  appVersion: string;
  brand?: string;
  manufacturer?: string;
  isTablet?: boolean;
  language: string;
  timezone: string;
  firstInstallTime?: number;
}

class DeviceIdentifierService {
  private deviceId: string | null = null;
  private anonymousId: string | null = null;
  
  constructor() {
    // Initialize device ID
    this.initialize();
  }
  
  /**
   * Initialize the service and ensure device IDs exist
   */
  private async initialize(): Promise<void> {
    try {
      // Try to load existing device ID
      const existingDeviceId = storage.getString(DEVICE_ID_KEY) || 
        await AsyncStorage.getItem(DEVICE_ID_KEY);
      
      if (existingDeviceId) {
        this.deviceId = existingDeviceId;
      } else {
        // Generate a new device ID
        this.deviceId = await this.generateDeviceId();
        
        // Save to persistent storage
        storage.set(DEVICE_ID_KEY, this.deviceId);
        await AsyncStorage.setItem(DEVICE_ID_KEY, this.deviceId);
      }
      
      // Also initialize anonymous ID
      await this.getAnonymousId();
    } catch (error) {
      console.error('Error initializing device identifier:', error);
      // Fallback to a random uuid if nothing else works
      this.deviceId = uuidv4();
    }
  }
  
  /**
   * Generate a unique device ID
   */
  private async generateDeviceId(): Promise<string> {
    try {
      // Try to use device's unique ID if available
      const nativeDeviceId = await DeviceInfo.getUniqueId();
      if (nativeDeviceId) {
        return nativeDeviceId;
      }
    } catch (error) {
      console.error('Error getting native device ID:', error);
    }
    
    // Fallback to a combination of device info
    try {
      const deviceName = await DeviceInfo.getDeviceName();
      const brand = DeviceInfo.getBrand();
      const model = DeviceInfo.getModel();
      const installTime = await DeviceInfo.getFirstInstallTime();
      
      // Combine these into a unique string
      const combinedInfo = `${deviceName}-${brand}-${model}-${installTime}`;
      
      // Hash the string (simplified version)
      let hash = 0;
      for (let i = 0; i < combinedInfo.length; i++) {
        const char = combinedInfo.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      
      return `device_${Math.abs(hash).toString(16)}`;
    } catch (error) {
      console.error('Error generating fallback device ID:', error);
    }
    
    // Last resort: random UUID
    return uuidv4();
  }
  
  /**
   * Get the device's unique identifier
   */
  public async getDeviceId(): Promise<string> {
    if (!this.deviceId) {
      await this.initialize();
    }
    return this.deviceId || uuidv4();
  }
  
  /**
   * Get an anonymous user ID (separate from device ID)
   */
  public async getAnonymousId(): Promise<string> {
    if (this.anonymousId) {
      return this.anonymousId;
    }
    
    try {
      // Try to load existing anonymous ID
      const existingId = storage.getString(ANONYMOUS_ID_KEY) || 
        await AsyncStorage.getItem(ANONYMOUS_ID_KEY);
      
      if (existingId) {
        this.anonymousId = existingId;
      } else {
        // Generate a new anonymous ID
        this.anonymousId = uuidv4();
        
        // Save to persistent storage
        storage.set(ANONYMOUS_ID_KEY, this.anonymousId);
        await AsyncStorage.setItem(ANONYMOUS_ID_KEY, this.anonymousId);
      }
      
      return this.anonymousId;
    } catch (error) {
      console.error('Error getting anonymous user ID:', error);
      // Fallback to a random uuid if nothing else works
      this.anonymousId = uuidv4();
      return this.anonymousId;
    }
  }
  
  /**
   * Reset the anonymous user ID (but keep device ID)
   */
  public async resetAnonymousId(): Promise<string> {
    try {
      // Generate a new anonymous ID
      this.anonymousId = uuidv4();
      
      // Save to persistent storage
      storage.set(ANONYMOUS_ID_KEY, this.anonymousId);
      await AsyncStorage.setItem(ANONYMOUS_ID_KEY, this.anonymousId);
      
      return this.anonymousId;
    } catch (error) {
      console.error('Error resetting anonymous user ID:', error);
      throw error;
    }
  }
  
  /**
   * Get detailed device information
   */
  public async getDeviceInfo(): Promise<DeviceInformation> {
    const deviceId = await this.getDeviceId();
    
    try {
      return {
        uniqueId: deviceId,
        model: DeviceInfo.getModel(),
        platform: Platform.OS,
        osVersion: DeviceInfo.getSystemVersion(),
        appVersion: DeviceInfo.getVersion(),
        brand: DeviceInfo.getBrand(),
        manufacturer: await DeviceInfo.getManufacturer(),
        isTablet: DeviceInfo.isTablet(),
        language: Platform.OS === 'ios' 
          ? await DeviceInfo.getDeviceLocale() 
          : await DeviceInfo.getSystemLanguage(),
        timezone: DeviceInfo.getTimezone(),
        firstInstallTime: await DeviceInfo.getFirstInstallTime()
      };
    } catch (error) {
      console.error('Error getting device information:', error);
      
      // Return minimal info if detailed info fails
      return {
        uniqueId: deviceId,
        model: 'unknown',
        platform: Platform.OS || 'unknown',
        osVersion: 'unknown',
        appVersion: 'unknown',
        language: 'en',
        timezone: 'UTC'
      };
    }
  }
  
  /**
   * Check if this is a fresh install
   */
  public async isFreshInstall(): Promise<boolean> {
    try {
      const firstInstall = await DeviceInfo.getFirstInstallTime();
      const lastUpdate = await DeviceInfo.getLastUpdateTime();
      
      // If first install and last update are within 1 minute, it's likely a fresh install
      return Math.abs(firstInstall - lastUpdate) < 60000;
    } catch (error) {
      console.error('Error checking if fresh install:', error);
      return false;
    }
  }
}

// Export singleton instance
export const deviceIdentifierService = new DeviceIdentifierService();