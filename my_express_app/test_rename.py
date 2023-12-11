import my_express_app
import pytest
import sys
import os
import requests
from flask import Flask
import unittest
from unittest.mock import MagicMock
from unittest.mock import patch
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(project_root)

from my_express_app.api_python import search_and_match, process_file, search, autocomplete, create_song
@pytest.fixture
def create_app():
    # Your app creation logic here
    app = Flask(__name__)
    return app

@pytest.fixture
def app():
    return create_app()

@pytest.fixture
def client(app):
    return app.test_client()

class TestSearchAndMatch(unittest.TestCase):
    @patch('my_express_app.api_python.sp')
    @patch('my_express_app.api_python.db')
    def test_search_and_match_with_matching_tracks(self, mock_db, mock_sp):
            # Mock Spotify API response
            mock_sp.search.return_value = {'tracks': {'items': [{'id': '123'}, {'id': '456'}]}}

            # Mock Firestore database response
            mock_query = MagicMock()
            mock_query.stream.return_value = [{'id': '123', 'name': 'Track1'}, {'id': '456', 'name': 'Track1'}]
            mock_db.collection.return_value.where.return_value = mock_query

            result = search_and_match('track1')

            self.assertEqual(result, [])

    @patch('my_express_app.api_python.sp')
    @patch('my_express_app.api_python.db')
    def test_search_and_match_with_no_matching_tracks(self, mock_db, mock_sp):
        # Mock Spotify API response
        mock_sp.search.return_value = {'tracks': {'items': [{'id': '123'}, {'id': '456'}]}}

        # Mock Firestore database response
        mock_query = MagicMock()
        mock_query.stream.return_value = []  # Empty list for no matching tracks
        mock_db.collection.return_value.where.return_value = mock_query

        result = search_and_match('Test Song')

        # Assert that the function returns an empty list when no matching tracks are found
        self.assertEqual(result, [])
    @patch('my_express_app.api_python.sp')
    @patch('my_express_app.api_python.db')
    def test_search_and_match_with_exception(self, mock_db, mock_sp):
        # Mock Spotify API response
        mock_sp.search.side_effect = Exception("Simulated error")

        result = search_and_match('Test Song')

        # Assert that the function returns an empty list in case of an exception
        self.assertEqual(result, [])
'''''''''       
class TestFlaskRoutes(unittest.TestCase):
    
    @patch('my_express_app.api_python.search_and_match')
    def test_search_route_with_matching_tracks(self, mock_search_and_match):
        # Mock the search_and_match function
        mock_search_and_match.return_value = ['track1', 'track2']

        # Make a test request to the /search route
        response = self.app.get('/search?songName=TestSong')

        # Assert that the response is as expected
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), {'matchingTrackIds': ['track1', 'track2']})

    @patch('my_express_app.api_python.search_and_match')
    def test_search_route_with_no_matching_tracks(self, mock_search_and_match):
        # Mock the search_and_match function
        mock_search_and_match.return_value = []

        # Make a test request to the /search route
        response = self.app.get('/search?songName=TestSong')

        # Assert that the response is as expected
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.get_json(), {'error': 'No matching documents found.'})

    @patch('my_express_app.api_python.sp')
    def test_autocomplete_route(self, mock_sp):
        # Mock the Spotify API response
        mock_sp.search.return_value = {'tracks': {'items': [{'id': '123', 'name': 'TestSong', 'artists': [{'name': 'Artist1'}], 'album': {'name': 'Album1', 'images': []}}]}}

        # Make a test request to the /autocomplete route
        response = self.app.get('/autocomplete?song=TestSong')

        # Assert that the response is as expected
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['suggestions'][0]['spotify_track_id'], '123')

class TestCreateSongRoute(unittest.TestCase):
    @pytest.fixture
    def create_app():
        # Your app creation logic here
        app = Flask(__name__)
        return app

    @pytest.fixture
    def app():
        return create_app()

    @pytest.fixture
    def client(app):
        return app.test_client()

    @patch('my_express_app.api_python.sp')
    @patch('my_express_app.api_python.db')
    def test_create_song_route_new_track(self, mock_db, mock_sp):
        # Mock the Spotify API response
        mock_sp.track.return_value = {
            'id': 'test_track_id',
            'name': 'TestSong',
            'album': {'id': 'test_album_id', 'name': 'TestAlbum', 'release_date': '2022-01-01', 'external_urls': {'spotify': 'album_url'}, 'images': []},
            'artists': [{'id': 'test_artist_id', 'name': 'TestArtist', 'external_urls': {'spotify': 'artist_url'}}],
            'duration_ms': 300000,
            'external_urls': {'spotify': 'track_url'},
            'acousticness': 0.5,
            'danceability': 0.7,
            'energy': 0.8,
            'instrumentalness': 0.2,
            'liveness': 0.3,
            'loudness': -10.0,
            'mode': 1,
            'tempo': 120,
            'key': 7,
            'valence': 0.6
        }

        # Mock Firestore database response
        mock_query = MagicMock()
        mock_query.stream.return_value = []  # Empty list for a new track
        mock_db.collection.return_value.where.return_value = mock_query

        # Make a test request to the /create_song route
        response = self.app.post('/create_song', json={'track_spotify_id': 'test_track_id'})

        # Assert that the response is as expected
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), {'success': True, 'message': 'Song "TestSong" saved to Firestore'})

    @patch('my_express_app.api_python.sp')
    @patch('my_express_app.api_python.db')
    def test_create_song_route_existing_track(self, mock_db, mock_sp):
        # Mock the Spotify API response
        mock_sp.track.return_value = {
            'id': 'test_track_id',
            'name': 'TestSong',
            'album': {'id': 'test_album_id', 'name': 'TestAlbum', 'release_date': '2022-01-01', 'external_urls': {'spotify': 'album_url'}, 'images': []},
            'artists': [{'id': 'test_artist_id', 'name': 'TestArtist', 'external_urls': {'spotify': 'artist_url'}}],
            'duration_ms': 300000,
            'external_urls': {'spotify': 'track_url'},
            'acousticness': 0.5,
            'danceability': 0.7,
            'energy': 0.8,
            'instrumentalness': 0.2,
            'liveness': 0.3,
            'loudness': -10.0,
            'mode': 1,
            'tempo': 120,
            'key': 7,
            'valence': 0.6
        }

        # Mock Firestore database response
        mock_query = MagicMock()
        mock_query.stream.return_value = [{'id': 'existing_track_id'}]  # Non-empty list for an existing track
        mock_db.collection.return_value.where.return_value = mock_query

        # Make a test request to the /create_song route
        response = self.app.post('/create_song', json={'track_spotify_id': 'test_track_id'})

        # Assert that the response is as expected
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), {'success': False, 'message': 'Track already exist in database'})

class TestProcessFileRoute(unittest.TestCase):
    @pytest.fixture
    def create_app():
        # Your app creation logic here
        app = Flask(__name__)
        return app

    @pytest.fixture
    def app():
        return create_app()

    @pytest.fixture
    def client(app):
        return app.test_client()
    @patch('my_express_app.api_python.sp')
    @patch('my_express_app.api_python.db')
    @patch('my_express_app.api_python.FieldFilter')
    def test_process_file_route(self,mock_field_filter, mock_db, mock_sp):
        # Mock the Spotify API response
        mock_sp.search.return_value = {
            'tracks': {'items': [
                {'id': 'test_track_id', 'name': 'TestSong', 'album': {'id': 'test_album_id', 'name': 'TestAlbum', 'images': []}, 'artists': [{'id': 'test_artist_id', 'name': 'TestArtist', 'external_urls': {'spotify': 'artist_url'}}]},
            ]}
        }

        # Mock Firestore database response
        mock_query = MagicMock()
        mock_query.stream.return_value = []  # Empty list for a new track
        mock_db.collection.return_value.where.return_value = mock_query

        # Mock FieldFilter
        mock_field_filter.return_value = MagicMock()

        # Make a test request to the /process_file route
        file_contents = 'Song1\nSong2\nSong3'
        response = self.app.post('/process_file', data={'file': (file_contents, 'test.txt')})

        # Assert that the response is as expected
        self.assertEqual(response.status_code, 200)
        suggestions_results = response.get_json()['results']
        self.assertEqual(len(suggestions_results), 3)

        # Assert that create_song_internal was called for each song
        mock_db.reset_mock()
        mock_sp.reset_mock()
        mock_field_filter.reset_mock()
        for result in suggestions_results:
            create_song_response = result['create_song_response']
            self.assertEqual(create_song_response['success'], True)
            self.assertEqual(create_song_response['message'], f'Song "{result["suggested_track_name"]}" saved to Firestore')
            # Add more assertions if needed
'''''''''