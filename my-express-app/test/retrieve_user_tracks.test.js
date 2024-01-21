const request = require('supertest');
const app = require('/Users/mvsbuse/music-alchemy-updated/music-alchemy/my-express-app/server.js'); // Replace with the actual path to your server file

describe('/retrieve_user_tracks endpoint', () => {
  // Test for valid UID
  it('should return user tracks for a valid UID', async () => {
    const validUid = 'm2y0Gj0PwxegLb8DaSDE5sQ75oC3'; // Replace with a valid UID from your database
    const response = await request(app)
      .post('/retrieve_user_tracks')
      .send({ uid: validUid });

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
  });

  // Test for non-existent UID
  it('should return a 404 error for non-existent UID', async () => {
    const nonExistentUid = '45678ioedfgh';
    const response = await request(app)
      .post('/retrieve_user_tracks')
      .send({ uid: nonExistentUid });

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ error: "User not found" });
  });

  // Test for missing UID
  it('should return a 404 error when no UID is provided', async () => {
    const response = await request(app)
      .post('/retrieve_user_tracks')
      .send({});

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ error: "UID is required" });
  });
});
