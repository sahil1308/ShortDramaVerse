// ShortDramaVerse Test Data Population Script
// This script populates the application with sample data for testing

import { storage } from './server/storage.ts';

async function populateTestData() {
  console.log('Populating test data...');
  
  // Create test users
  const users = [
    {
      username: 'admin',
      email: 'admin@example.com',
      password: '$2b$10$Y0Yw9FztXXiIGGWNBKWMDuBYegSHX4Q3uQw1GwjHXXKk6xpMzbW3u', // 'password123'
      displayName: 'Admin User',
      profilePicture: 'https://i.pravatar.cc/150?u=admin',
      bio: 'Administrator of ShortDramaVerse',
      isAdmin: true,
      coinBalance: 1000
    },
    {
      username: 'testuser',
      email: 'user@example.com',
      password: '$2b$10$Y0Yw9FztXXiIGGWNBKWMDuBYegSHX4Q3uQw1GwjHXXKk6xpMzbW3u', // 'password123'
      displayName: 'Test User',
      profilePicture: 'https://i.pravatar.cc/150?u=testuser',
      bio: 'Just a test user enjoying short dramas',
      isAdmin: false,
      coinBalance: 100
    }
  ];
  
  // Create test drama series
  const dramaSeries = [
    {
      title: 'Midnight Secrets',
      description: 'A thrilling mystery series about a detective who can only solve crimes at night.',
      thumbnailUrl: 'https://picsum.photos/seed/midnight/300/200',
      genres: ['Mystery', 'Thriller'],
      releaseYear: 2023,
      averageRating: 4.5,
      episodes: 12,
      duration: '15 min',
      isLocked: false,
      price: 0
    },
    {
      title: 'Love in Seoul',
      description: 'A romantic comedy about expatriates finding love in the busy streets of Seoul.',
      thumbnailUrl: 'https://picsum.photos/seed/seoul/300/200',
      genres: ['Romance', 'Comedy'],
      releaseYear: 2022,
      averageRating: 4.2,
      episodes: 8,
      duration: '20 min',
      isLocked: false,
      price: 0
    },
    {
      title: 'Corporate Chaos',
      description: 'A satirical look at the everyday absurdities of corporate life.',
      thumbnailUrl: 'https://picsum.photos/seed/corporate/300/200',
      genres: ['Comedy', 'Drama'],
      releaseYear: 2023,
      averageRating: 4.0,
      episodes: 10,
      duration: '15 min',
      isLocked: true,
      price: 50
    },
    {
      title: 'Historical Heroes',
      description: 'Dramatized stories of unsung heroes from throughout history.',
      thumbnailUrl: 'https://picsum.photos/seed/history/300/200',
      genres: ['Historical', 'Drama'],
      releaseYear: 2021,
      averageRating: 4.7,
      episodes: 6,
      duration: '25 min',
      isLocked: true,
      price: 100
    }
  ];
  
  // Create test episodes
  async function createEpisodesForSeries(seriesId, count, isFree = true) {
    const episodes = [];
    for (let i = 1; i <= count; i++) {
      const episode = {
        seriesId,
        title: `Episode ${i}`,
        description: `This is episode ${i} of the series.`,
        videoUrl: `https://example.com/series/${seriesId}/episode${i}.mp4`,
        thumbnailUrl: `https://picsum.photos/seed/ep${seriesId}${i}/300/200`,
        duration: '15:00',
        releaseDate: new Date(2023, 0, i),
        episodeNumber: i,
        isLocked: !isFree && i > 2, // First two episodes free in premium series
        viewCount: Math.floor(Math.random() * 1000)
      };
      
      const createdEpisode = await storage.createEpisode(episode);
      episodes.push(createdEpisode);
    }
    return episodes;
  }
  
  // Create test advertisements
  const advertisements = [
    {
      title: 'Premium Subscription',
      description: 'Upgrade to premium for unlimited access to all content.',
      imageUrl: 'https://picsum.photos/seed/premium/600/200',
      linkUrl: '/subscribe',
      placement: 'homepage',
      startDate: new Date(2023, 0, 1),
      endDate: new Date(2025, 11, 31),
      isActive: true,
      impressions: 0,
      clicks: 0
    },
    {
      title: 'New Series: Medical Mysteries',
      description: 'Coming soon: A thrilling medical drama series.',
      imageUrl: 'https://picsum.photos/seed/medical/600/200',
      linkUrl: '/coming-soon/medical-mysteries',
      placement: 'series-page',
      startDate: new Date(2023, 0, 1),
      endDate: new Date(2025, 11, 31),
      isActive: true,
      impressions: 0,
      clicks: 0
    }
  ];
  
  try {
    // Add users
    const createdUsers = [];
    for (const user of users) {
      try {
        const createdUser = await storage.createUser(user);
        createdUsers.push(createdUser);
        console.log(`Created user: ${createdUser.username}`);
      } catch (error) {
        console.error(`Error creating user ${user.username}:`, error.message);
      }
    }
    
    // Add drama series
    const createdSeries = [];
    for (const series of dramaSeries) {
      try {
        const createdSeries = await storage.createDramaSeries(series);
        console.log(`Created series: ${createdSeries.title}`);
        
        // Create episodes for this series
        const isFree = !series.isLocked;
        const episodes = await createEpisodesForSeries(createdSeries.id, series.episodes, isFree);
        console.log(`Created ${episodes.length} episodes for ${createdSeries.title}`);
      } catch (error) {
        console.error(`Error creating series ${series.title}:`, error.message);
      }
    }
    
    // Add advertisements
    for (const ad of advertisements) {
      try {
        const createdAd = await storage.createAdvertisement(ad);
        console.log(`Created advertisement: ${createdAd.title}`);
      } catch (error) {
        console.error(`Error creating advertisement ${ad.title}:`, error.message);
      }
    }
    
    // Add some user-specific data if users were created
    if (createdUsers.length > 0) {
      const testUser = createdUsers.find(u => u.username === 'testuser');
      if (testUser) {
        // Add to watchlist
        const allSeries = await storage.getAllDramaSeries();
        if (allSeries.length > 0) {
          await storage.addToWatchlist({
            userId: testUser.id,
            seriesId: allSeries[0].id
          });
          console.log(`Added ${allSeries[0].title} to ${testUser.username}'s watchlist`);
          
          // Add rating
          await storage.createRating({
            userId: testUser.id,
            seriesId: allSeries[0].id,
            rating: 5,
            comment: 'Absolutely loved this series!'
          });
          console.log(`Added rating for ${allSeries[0].title} from ${testUser.username}`);
          
          // Add watch history
          const episodes = await storage.getEpisodesBySeriesId(allSeries[0].id);
          if (episodes.length > 0) {
            await storage.addToWatchHistory({
              userId: testUser.id,
              episodeId: episodes[0].id,
              watchedAt: new Date(),
              watchDuration: 840, // 14 minutes in seconds
              completed: true
            });
            console.log(`Added ${episodes[0].title} to ${testUser.username}'s watch history`);
          }
        }
      }
    }
    
    console.log('Test data population complete!');
    
  } catch (error) {
    console.error('Error populating test data:', error);
  }
}

// Run the function
populateTestData()
  .then(() => console.log('Done!'))
  .catch(error => console.error('Error:', error));