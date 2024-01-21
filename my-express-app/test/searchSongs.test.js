// Mock the searchInFirestore function before importing the server
jest.mock('/Users/mvsbuse/music-alchemy-updated/music-alchemy/my-express-app/server.js', () => ({
    searchInFirestore: jest.fn().mockImplementation((trackName, artistName) => {
      // Return mock data or an empty array based on inputs
      return trackName === 'Test Track' ? [{ track_id: 'mockId' }] : [];
    })
  }));

const request = require('supertest');
const app = require('/Users/mvsbuse/music-alchemy-updated/music-alchemy/my-express-app/server.js');


  describe('/search_songs endpoint', () => {
    it('should return 200 with results for valid request', async () => {
      const response = await request(app)
        .post('/search_songs')
        .send({ tracks: [{ track_name: 'Test Track', artist_name: 'Test Artist' }] });
  
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('results');
      expect(response.body.results).toEqual([{ track_id: 'mockId' }]); // Verify content
    });
  
    it('should return 400 when no tracks are provided', async () => {
      const response = await request(app)
        .post('/search_songs')
        .send({});
  
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error', 'No tracks provided');
    });
  
    it('should return 204 when no matching tracks are found', async () => {
      const response = await request(app)
        .post('/search_songs')
        .send({ tracks: [{ track_name: 'Krunk', artist_name: 'Gomitas Vartabed' }] });
  
      expect(response.statusCode).toBe(204);
    });
  
    // Additional test cases...
  });
  // Close the server after tests

  