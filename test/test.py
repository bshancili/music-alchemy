import pytest
import requests
from unittest.mock import MagicMock
from unittest.mock import patch
from my_express_app.api_python import search_and_match, process_file, search, autocomplete, create_song

def client():
    with api_pyhton.test_client() as client:
        yield client

def test_search_and_match():
    with patch('your_app_module.sp') as mock_sp:
        # Mock the response from Spotify API
        mock_sp.search.return_value = {'tracks': {'items': [{'id': '123', 'name': 'Test Song'}]}}

        result = search_and_match('Test Song')

        assert result == ['123']

def test_search(client):
    response = client.get('/search?songName=Test Song')

    assert response.status_code == 200
    assert response.json['matchingTrackIds'] == ['123']  # Adjust with the expected result

def test_autocomplete(client):
    response = client.get('/autocomplete?song=Test')


    assert response.status_code == 200
    assert 'suggestions' in response.json

def test_create_song(client):
    with patch('my_express_app.api_python.sp') as mock_sp, \
         patch('my_express_app.api_python.db.collection') as mock_collection:
        # Mock the response from Spotify API
        mock_sp.track.return_value = {
            'id': '456',
            'name': 'Test Song',
            'album': {'id': '789', 'name': 'Test Album'},
            'artists': [{'id': '101', 'name': 'Test Artist'}],
            'duration_ms': 300000,
            'external_urls': {'spotify': 'https://example.com'},
            'track': {'id': '456'}
        }

        # Mock the Firestore collection
        mock_collection.return_value.where.return_value.stream.return_value = []
        
        response = create_song({'track_spotify_id': '456'})

        assert response['success'] == True
        assert response['message'] == 'Song "Test Song" saved to Firestore'

class TestProcessFile(unittest.TestCase):
    @patch('my_express_app.api_python.request')
    @patch('my_express_app.api_python.sp')
    @patch('my_express_app.api_python.create_song_internal')
    def test_process_file_with_file(self, mock_create_song_internal, mock_sp, mock_request):
        # Mock the file
        file_mock = MagicMock()
        file_mock.read.return_value.decode.return_value.splitlines.return_value = ['Song1', 'Song2']
        mock_request.files.get.return_value = file_mock

        # Mock Spotify API response
        mock_sp.search.return_value = {'tracks': {'items': [{'id': '123', 'name': 'SuggestedSong1',
                                                               'artists': [{'name': 'Artist1'}],
                                                               'album': {'name': 'Album1'}}]}}

        # Mock create_song_internal response
        mock_create_song_internal.return_value = {'success': True, 'message': 'Song created successfully'}

        # Call the function
        response = process_file()

        # Assertions
        assert response.status_code == 200
        assert 'results' in response.json

        results = response.json['results']
        assert len(results) == 2

        # Check the first suggestion
        suggestion1 = results[0]
        assert suggestion1['song_entered'] == 'Song1'
        assert suggestion1['suggested_track_name'] == 'SuggestedSong1'
        assert suggestion1['suggested_artist(s)'] == ['Artist1']
        assert suggestion1['suggested_album_name'] == 'Album1'
        assert suggestion1['create_song_response'] == {'success': True, 'message': 'Song created successfully'}

        # Check the second suggestion similarly

    @patch('my_express_app.api_python.request')
    def test_process_file_without_file(self, mock_request):
        # Mock the absence of file
        mock_request.files.get.return_value = None

        # Call the function
        response = process_file()

        # Assertions
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json, {'error': 'No file provided'})
