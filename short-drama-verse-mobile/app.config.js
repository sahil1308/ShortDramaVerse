module.exports = {
  name: "ShortDramaVerse",
  slug: "short-drama-verse",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./src/assets/icon.png",
  splash: {
    image: "./src/assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  notification: {
    icon: "./src/assets/notification-icon.png",
    color: "#ff5e3a",
    androidMode: "default",
    androidCollapsedTitle: "ShortDramaVerse",
    iosDisplayInForeground: true,
  },
  plugins: [
    [
      "expo-notifications",
      {
        icon: "./src/assets/notification-icon.png",
        color: "#ff5e3a",
        sounds: [
          "./src/assets/notification-sound.wav"
        ]
      }
    ]
  ],
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.shortdramaverse.app"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./src/assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF"
    },
    package: "com.shortdramaverse.app"
  },
  web: {
    favicon: "./src/assets/favicon.png"
  },
  extra: {
    eas: {
      projectId: "short-drama-verse"
    }
  }
};