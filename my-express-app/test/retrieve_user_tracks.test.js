const request = require('supertest');
const app = require('/Users/mvsbuse/music-alchemy-updated/music-alchemy/my-express-app/server.js'); // Adjust the path to your server.js file

describe('/retrieve_user_tracks endpoint', () => {
  it('should return user tracks for a valid UID', async () => {
    const testUid = 'm2y0Gj0PwxegLb8DaSD5oC3'; // Replace with a valid UID for testing
    const response = await request(app)
      .post('/retrieve_user_tracks')
      .send({ uid: testUid });

    expect(response.statusCode).toBe(200);
    // Replace the following assertions with the expected structure of your response
    expect(Array.isArray(response.body)).toBeTruthy();
    response.body.forEach(track => {
      expect(track).toHaveProperty('id', testUid);
      expect(track).toHaveProperty('rated_songs');
      expect(track).toHaveProperty('liked_songs');
    });
  });

  it('should return an empty array or specific response for non-existent UID', async () => {
    const nonExistentUid = 'y0Gj0PwxegLb8DaSD5oC3'; // A UID you know does not exist in your database
    const response = await request(app)
      .post('/retrieve_user_tracks')
      .send({ uid: nonExistentUid });
  
    expect(response.statusCode).toBe(200);
    // If your endpoint returns an empty array for non-existent UIDs
    expect(response.body).toEqual([]);
    // If your endpoint returns a specific message or structure for non-existent UIDs
    // expect(response.body).toEqual({ /* expected structure */ });
  });
  

  // Additional test cases for scenarios like an invalid UID, missing UID, etc.
});
