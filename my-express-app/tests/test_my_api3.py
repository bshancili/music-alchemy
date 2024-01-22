import unittest
from unittest.mock import patch, MagicMock
from flask import json
from apispython import app

class TestCreateSongAPI(unittest.TestCase):

    def setUp(self):
        app.testing = True
        self.client = app.test_client()

    def mock_spotify_responses(self, mock_sp_track, mock_sp_audio_features, mock_sp_artist):
        mock_sp_track.return_value = {
            'id': '5v1B5Qq6yDazDwfYrcXpZO', 
            'album': {'id': '1jPOCIjCqYhzN4yVQhpeLB'}, 
            'artists': [{'id': '08BcOmBSaEW9ILEKc4MXvQ', 'name': 'Binnaz Sönmez Dursun'}],
            'name': 'Tuvalet Eğitimi Şarkısı'
        }
        mock_sp_audio_features.return_value = [{
            "danceability": 0.8,
            "energy": 0.7,
            "key": 1,
            "loudness": -5.0,
            "mode": 1,
            "speechiness": 0.05,
            "acousticness": 0.1,
            "instrumentalness": 0.0,
            "liveness": 0.1,
            "valence": 0.6,
            "tempo": 120.0,
            "id": "5v1B5Qq6yDazDwfYrcXpZO",
            "uri": "spotify:track:5v1B5Qq6yDazDwfYrcXpZO",
            "track_href": "https://api.spotify.com/v1/tracks/5v1B5Qq6yDazDwfYrcXpZO",
            "analysis_url": "https://api.spotify.com/v1/audio-analysis/5v1B5Qq6yDazDwfYrcXpZO",
            "duration_ms": 210000,
            "time_signature": 4
        }]
        mock_sp_artist.return_value = {'images': [
            {"url": "https://i.scdn.co/image/ab67616d0000b27313ae31b16da366000142ad7d", "height": 640, "width": 640},
            {"url": "https://i.scdn.co/image/ab67616d00001e0213ae31b16da366000142ad7d", "height": 300, "width": 300},
            {"url": "https://i.scdn.co/image/ab67616d0000485113ae31b16da366000142ad7d", "height": 64, "width": 64}
        ]}

    @patch('apispython.sp.track')
    @patch('apispython.sp.audio_features')
    @patch('apispython.sp.artist')
    @patch('apispython.db.collection')
    def test_create_song_success(self, mock_db_collection, mock_sp_artist, mock_sp_audio_features, mock_sp_track):
        self.mock_spotify_responses(mock_sp_track, mock_sp_audio_features, mock_sp_artist)
        mock_query_stream = MagicMock()
        mock_db_collection.return_value.where.return_value.limit.return_value.stream = MagicMock(return_value=mock_query_stream)
        mock_query_stream.return_value = iter([])

        response = self.client.post('http://localhost:8080/create_song', json={'track_spotify_id': '5v1B5Qq6yDazDwfYrcXpZO'})
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.data)
        self.assertTrue(response_data['success'])
        self.assertIn('Song "Tuvalet Eğitimi Şarkısı" saved to Firestore', response_data['message'])


    @patch('apispython.sp.track')
    @patch('apispython.sp.audio_features')
    @patch('apispython.sp.artist')
    @patch('apispython.db.collection')
    def test_create_song_missing_parameter(self, mock_db_collection, mock_sp_artist, mock_sp_audio_features, mock_sp_track):
        self.mock_spotify_responses(mock_sp_track, mock_sp_audio_features, mock_sp_artist)

        response = self.client.post('http://localhost:8080/create_song', json={})
        self.assertEqual(response.status_code, 400)
        response_data = json.loads(response.data)
        self.assertIn('Missing song parameter', response_data['message'])

if __name__ == '__main__':
    unittest.main()
