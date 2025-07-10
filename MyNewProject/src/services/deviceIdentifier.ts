/**
 * Device Identifier Service
 * 
 * This service handles device identification and unique ID generation
 * for cross-platform user tracking while maintaining privacy.
 */

import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'device_unique_id';
const DEVICE_INFO_KEY = 'device_info';

export interface DeviceInformation {
  deviceId: string;
  deviceName: string;
  brand: string;
  model: string;
  systemName: string;
  systemVersion: string;
  buildNumber: string;
  appVersion: string;
  isTablet: boolean;
  hasNotch: boolean;
  screenWidth: number;
  screenHeight: number;
  timezone: string;
  carrier: string;
  totalMemory: number;
  ipAddress: string;
  macAddress: string;
  userAgent: string;
  createdAt: string;
  lastUpdated: string;
}

/**
 * Initialize device identifier system
 */
export const initializeDeviceIdentifier = async (): Promise<void> => {
  try {
    // Check if device ID already exists
    const existingDeviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    
    if (!existingDeviceId) {
      // Generate new device ID
      const deviceId = await generateUniqueId();
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
      
      // Collect and store device information
      const deviceInfo = await collectDeviceInformation(deviceId);
      await AsyncStorage.setItem(DEVICE_INFO_KEY, JSON.stringify(deviceInfo));
      
      console.log('Device identifier initialized:', deviceId);
    } else {
      console.log('Existing device ID found:', existingDeviceId);
      
      // Update device information
      await updateDeviceInformation();
    }
  } catch (error) {
    console.error('Failed to initialize device identifier:', error);
    throw error;
  }
};

/**
 * Generate unique device ID
 */
export const generateUniqueId = async (): Promise<string> => {
  try {
    // Try to get hardware-based unique ID first
    const uniqueId = await DeviceInfo.getUniqueId();
    
    // If that fails, generate a random ID
    if (!uniqueId) {
      const randomId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return randomId;
    }
    
    return uniqueId;
  } catch (error) {
    console.error('Failed to generate unique ID:', error);
    // Fallback to timestamp-based ID
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};

/**
 * Get device unique ID
 */
export const getDeviceId = async (): Promise<string> => {
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    
    if (!deviceId) {
      deviceId = await generateUniqueId();
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.error('Failed to get device ID:', error);
    return await generateUniqueId();
  }
};

/**
 * Collect comprehensive device information
 */
export const collectDeviceInformation = async (deviceId: string): Promise<DeviceInformation> => {
  try {
    const deviceInfo: DeviceInformation = {
      deviceId,
      deviceName: await DeviceInfo.getDeviceName(),
      brand: await DeviceInfo.getBrand(),
      model: await DeviceInfo.getModel(),
      systemName: await DeviceInfo.getSystemName(),
      systemVersion: await DeviceInfo.getSystemVersion(),
      buildNumber: await DeviceInfo.getBuildNumber(),
      appVersion: await DeviceInfo.getVersion(),
      isTablet: await DeviceInfo.isTablet(),
      hasNotch: await DeviceInfo.hasNotch(),
      screenWidth: 0, // Will be set from Dimensions
      screenHeight: 0, // Will be set from Dimensions
      timezone: await DeviceInfo.getTimezone(),
      carrier: await DeviceInfo.getCarrier(),
      totalMemory: await DeviceInfo.getTotalMemory(),
      ipAddress: await DeviceInfo.getIpAddress(),
      macAddress: await DeviceInfo.getMacAddress(),
      userAgent: await DeviceInfo.getUserAgent(),
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    
    return deviceInfo;
  } catch (error) {
    console.error('Failed to collect device information:', error);
    
    // Return minimal device info as fallback
    return {
      deviceId,
      deviceName: 'Unknown Device',
      brand: 'Unknown',
      model: 'Unknown',
      systemName: 'Unknown',
      systemVersion: 'Unknown',
      buildNumber: 'Unknown',
      appVersion: '1.0.0',
      isTablet: false,
      hasNotch: false,
      screenWidth: 0,
      screenHeight: 0,
      timezone: 'Unknown',
      carrier: 'Unknown',
      totalMemory: 0,
      ipAddress: 'Unknown',
      macAddress: 'Unknown',
      userAgent: 'Unknown',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
  }
};

/**
 * Get stored device information
 */
export const getDeviceInformation = async (): Promise<DeviceInformation | null> => {
  try {
    const deviceInfoData = await AsyncStorage.getItem(DEVICE_INFO_KEY);
    
    if (deviceInfoData) {
      return JSON.parse(deviceInfoData);
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get device information:', error);
    return null;
  }
};

/**
 * Update device information (for periodic updates)
 */
export const updateDeviceInformation = async (): Promise<void> => {
  try {
    const deviceId = await getDeviceId();
    const currentInfo = await getDeviceInformation();
    
    if (currentInfo) {
      // Update only dynamic fields
      const updatedInfo: DeviceInformation = {
        ...currentInfo,
        systemVersion: await DeviceInfo.getSystemVersion(),
        appVersion: await DeviceInfo.getVersion(),
        carrier: await DeviceInfo.getCarrier(),
        ipAddress: await DeviceInfo.getIpAddress(),
        lastUpdated: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(DEVICE_INFO_KEY, JSON.stringify(updatedInfo));
    } else {
      // Create new device info if none exists
      const deviceInfo = await collectDeviceInformation(deviceId);
      await AsyncStorage.setItem(DEVICE_INFO_KEY, JSON.stringify(deviceInfo));
    }
  } catch (error) {
    console.error('Failed to update device information:', error);
  }
};

/**
 * Check if device is rooted/jailbroken (for security)
 */
export const checkDeviceSecurity = async (): Promise<{
  isRooted: boolean;
  isEmulator: boolean;
  isDebuggingEnabled: boolean;
}> => {
  try {
    const [isRooted, isEmulator] = await Promise.all([
      DeviceInfo.isRooted(),
      DeviceInfo.isEmulator(),
    ]);
    
    return {
      isRooted,
      isEmulator,
      isDebuggingEnabled: await DeviceInfo.isDebuggingEnabled(),
    };
  } catch (error) {
    console.error('Failed to check device security:', error);
    return {
      isRooted: false,
      isEmulator: false,
      isDebuggingEnabled: false,
    };
  }
};

/**
 * Get device performance metrics
 */
export const getDevicePerformanceMetrics = async (): Promise<{
  totalMemory: number;
  usedMemory: number;
  freeMemory: number;
  totalStorage: number;
  freeStorage: number;
  batteryLevel: number;
  isCharging: boolean;
}> => {
  try {
    const [totalMemory, usedMemory, freeStorage, batteryLevel, isCharging] = await Promise.all([
      DeviceInfo.getTotalMemory(),
      DeviceInfo.getUsedMemory(),
      DeviceInfo.getFreeDiskStorage(),
      DeviceInfo.getBatteryLevel(),
      DeviceInfo.isBatteryCharging(),
    ]);
    
    return {
      totalMemory,
      usedMemory,
      freeMemory: totalMemory - usedMemory,
      totalStorage: freeStorage * 2, // Approximation
      freeStorage,
      batteryLevel,
      isCharging,
    };
  } catch (error) {
    console.error('Failed to get device performance metrics:', error);
    return {
      totalMemory: 0,
      usedMemory: 0,
      freeMemory: 0,
      totalStorage: 0,
      freeStorage: 0,
      batteryLevel: 0,
      isCharging: false,
    };
  }
};