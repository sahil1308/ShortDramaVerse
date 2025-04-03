export default ({ config }) => {
  return {
    ...config,
    extra: {
      apiUrl: process.env.API_URL || 'http://localhost:3000',
      eas: {
        projectId: "your-project-id",
      },
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ["**/*"],
    plugins: [
      [
        "expo-image-picker",
        {
          photosPermission: "The app accesses your photos to let you share them with your friends.",
          cameraPermission: "The app accesses your camera to let you take photos to share with your friends."
        }
      ]
    ]
  };
};