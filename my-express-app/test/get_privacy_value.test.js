const request = require('supertest');
const app = require('/Users/mvsbuse/music-alchemy-updated/music-alchemy/my-express-app/server.js'); 

describe('/get_privacy_value endpoint', () => {
  // Test for missing UID
  it('should return a 400 error for missing UID', async () => {
    const response = await request(app)
      .post('/get_privacy_value')
      .send({}); // Sending an empty body

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error', 'No UID provided');
  });

  // Test for non-existent UID
  it('should return a 404 error for non-existent UID', async () => {
    const nonExistentUid = 'blabalbla789'; 
    const response = await request(app)
      .post('/get_privacy_value')
      .send({ uid: nonExistentUid });

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('error', 'User not found');
  });

  // Test for existing UID with privacy value
  it('should return the privacy value for a valid UID', async () => {
    const validUid = 'uuj87MEQVdhCAZn1eUyabo13S9o2'; // 
    const response = await request(app)
      .post('/get_privacy_value')
      .send({ uid: validUid });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('isPrivate');
    expect(typeof response.body.isPrivate).toBe('boolean');
  });

});
