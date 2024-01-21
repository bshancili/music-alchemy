const request = require('supertest');
const app = require('/Users/mvsbuse/music-alchemy-updated/music-alchemy/my-express-app/server.js'); 

describe('/get_track_artist endpoint', () => {
  // Test for valid document ID
  it('should return artist data for a valid document ID', async () => {
    const validDocId = '14TofuaGso8bUKs1AywH'; 
    const response = await request(app)
      .post('/get_track_artist')
      .send({ docId: validDocId });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('artist');
  });

  // Test for non-existent document ID
  it('should return a 404 error for non-existent document ID', async () => {
    const nonExistentDocId = '3456dfgh';
    const response = await request(app)
      .post('/get_track_artist')
      .send({ docId: nonExistentDocId });

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ message: "Document not found" });
  });
});
