const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const { find_recommended_track } = require('/Users/mvsbuse/music-alchemy-updated/music-alchemy/my-express-app/server.js');

describe('find_recommended_track function', () => {
  const mock = new MockAdapter(axios);

  // Test for successful track search
  it('should return recommended tracks', async () => {
    const mockData = {
      results: [
        { track_id: '1nZDeocXM33yFc8DW5t7' },
        { track_id: 'EbIRC1UWY2zqquwCBdTD' }
      ]
    };
    mock.onPost("http://localhost:3000/search_songs").reply(200, mockData);

    const prompt = 'Some - Steve Lacy\nRüzgar Gülü - Teoman';
    const results = await find_recommended_track(prompt);

    expect(results).toEqual(mockData.results);
    mock.reset();
  });

  // Test for handling errors from the search_songs endpoint
  it('should handle errors gracefully', async () => {
    mock.onPost("http://localhost:3000/search_songs").networkError();

    const prompt = ' \n ';
    const results = await find_recommended_track(prompt);
    

    expect(results).toEqual([]);
    mock.reset();
  });

});
