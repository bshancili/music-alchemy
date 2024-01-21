const request = require('supertest');
const app = require('/Users/mvsbuse/music-alchemy-updated/music-alchemy/my-express-app/server.js'); 

describe('/find_song_name endpoint', () => {
  // Test for a valid document ID
  it('should return the song name for a valid document ID', async () => {
    const validDocId = '0V43k4wyRz5mDWWCrJLk'; 
    const response = await request(app)
      .post('/find_song_name')
      .send({ docId: validDocId });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('name');
  });

  // Test for a non-existent document ID
  it('should return a 404 error for a non-existent document ID', async () => {
    const nonExistentDocId = '1234gggg'; // A non-existent document ID
    const response = await request(app)
      .post('/find_song_name')
      .send({ docId: nonExistentDocId });

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ message: "Document not found" });
  });


});
