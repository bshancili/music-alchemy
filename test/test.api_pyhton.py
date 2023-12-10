import pytest
import requests
from unittest.mock import patch
from my_express_app.api_python import search_and_match,search,autocomplete,create_song

def client():
    with my_express_app.app.test_client() as client:
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

        response = client.post('/create_song', json={'track_spotify_id': '456'})

        assert response.status_code == 200
        assert response.json['success'] == True
        assert response.json['message'] == 'Song "Test Song" saved to Firestore'
