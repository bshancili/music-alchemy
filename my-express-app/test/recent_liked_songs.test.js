const request = require('supertest');
const app = require('/Users/mvsbuse/music-alchemy-updated/music-alchemy/my-express-app/server.js'); 

describe('/recent_liked_songs endpoint', () => {
  // Test for valid UID
  it('should return recent liked songs for a valid UID', async () => {
    const validUid = 'm2y0Gj0PwxegLb8DaSDE5sQ75oC3'; 
    const response = await request(app)
      .post('/recent_liked_songs')
      .send({ uid: validUid });

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
  });

  // Test for non-existent UID
  it('should return a 404 error for non-existent UID', async () => {
    const nonExistentUid = 'nonExistentUid';
    const response = await request(app)
      .post('/recent_liked_songs')
      .send({ uid: nonExistentUid });

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ error: "User not found" });
  });

  // Test for missing UID
  it('should return a 400 error when no UID is provided', async () => {
    const response = await request(app)
      .post('/recent_liked_songs')
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ error: "UID is required" });
  });
});
