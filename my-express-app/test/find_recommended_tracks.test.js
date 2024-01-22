const request = require('supertest');
const app = require('/Users/mvsbuse/music-alchemy-updated/music-alchemy/my-express-app/server.js'); 

describe('/find_recommended_tracks endpoint', () => {
  
  it('should return recommendations for a valid UID with songs', async () => {
    const testUid = 'WtKmdL1KdXgrq59oXKGon4hayxB3'; // Replace with actual UID
    const response = await request(app)
      .post('/find_recommended_tracks')
      .send({ uid: testUid });

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy(); // Expect an array
    expect(response.body.length).toBeGreaterThan(0); // Expect at least one element in the array
    response.body.forEach(item => {
        expect(item).toHaveProperty('track_id');
    });
  }, 100000);

  it('should return an appropriate message for a valid UID without songs', async () => {
    const testUid = 'lRVg0SJS7dUjDuBDkjM6uk1QBDx1'; // Replace with actual UID
    const response = await request(app)
      .post('/find_recommended_tracks')
      .send({ uid: testUid });

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ message: "No songs found to recommend" });
  });

  it('should return an error for an invalid or non-existent UID', async () => {
    const nonExistentUid = 'blabla2024';
    const response = await request(app)
      .post('/find_recommended_tracks')
      .send({ uid: nonExistentUid });

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('error', 'User not found' );
  });

  it('should return a 404 error when no UID is provided', async () => {
    const response = await request(app)
      .post('/find_recommended_tracks')
      .send({}); // No UID provided

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error', 'UID is required');
  });

});
