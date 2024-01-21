const request = require('supertest');
const app = require('/Users/mvsbuse/music-alchemy-updated/music-alchemy/my-express-app/server.js'); // Adjust the path to your server.js file

// Mock the searchInFirestore function if necessary
jest.mock('/Users/mvsbuse/music-alchemy-updated/music-alchemy/my-express-app/server.js', () => ({
    searchInFirestore: jest.fn().mockImplementation((trackName, artistName) => {
      // Mock behavior based on input
      if (trackName === 'Existing Track') {
        return Promise.resolve([{ track_id: 'mockId' }]);
      } else {
        return Promise.resolve([]);
      }
    }),
  }));
describe('/search_songs endpoint', () => {
  it('should respond correctly to a POST request', async () => {
    const response = await request(app)
      .post('/search_songs')
      .send({ tracks: [{ track_name: 'Existing Track', artist_name: 'Artist' }] });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('results');
    expect(response.body.results).toEqual([{ track_id: 'mockId' }]);
  });

  // Other tests...
});
