const request = require('supertest');
const app = require('/Users/mvsbuse/music-alchemy-updated/music-alchemy/my-express-app/server.js'); // Replace with the actual path to your server file

describe('/retrieve_friend_list endpoint', () => {
  // Test for missing UID
  it('should return a 400 error for missing UID', async () => {
    const response = await request(app)
      .post('/retrieve_friend_list')
      .send({}); // Sending an empty body

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('error', 'UID is required');
  });

  // Test for non-existent UID
  it('should return a 404 error for non-existent UID', async () => {
    const nonExistentUid = '123456fghj'; // A UID that does not exist in your database
    const response = await request(app)
      .post('/retrieve_friend_list')
      .send({ uid: nonExistentUid });

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('error', 'User not found');
  });

  // Test for existing UID with empty friend list
  it('should return a message for empty friend list', async () => {
    const uidWithEmptyList = '7fF97ubRCZR3KHvuB8MSJbWALB52'; // Replace with a UID that exists but has an empty friend list
    const response = await request(app)
      .post('/retrieve_friend_list')
      .send({ uid: uidWithEmptyList });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Friend list is empty');
  });

  // Test for existing UID with non-empty friend list
  it('should return the friend list for a valid UID with non-empty list', async () => {
        const validUidWithFriends = 'DbGl1butc2gnZY0V4wPhURhfwNq1'; // Replace with a UID that has a non-empty friend list
        const response = await request(app)
        .post('/retrieve_friend_list')
        .send({ uid: validUidWithFriends });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('friends_list');
        expect(Array.isArray(response.body.friends_list)).toBeTruthy();
        expect(response.body.friends_list.length).toBeGreaterThan(0); // Ensure the list is not empty
   });

  
});
