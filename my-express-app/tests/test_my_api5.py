import io
import unittest
from unittest.mock import patch, MagicMock
from flask import json
from apispython import app  # Replace with the actual name of your Flask app module

class TestProcessFileAPI(unittest.TestCase):

    def setUp(self):
        app.testing = True
        self.client = app.test_client()

    @patch('apispython.sp.search')
    @patch('apispython.sp.track')
    @patch('apispython.sp.audio_features')
    @patch('apispython.sp.artist')
    @patch('apispython.db.collection')
    def test_process_file(self, mock_db_collection, mock_sp_artist, mock_sp_audio_features, mock_sp_track, mock_sp_search):
        # Set up mock responses
        mock_sp_search.return_value = {
            'tracks': {
                'items': [
                    {
                        'name': 'Tuvalet Eğitimi Şarkısı ',
                        'artists': [{'name': 'Binnaz Sönmez Dursun'}],
                        'id': '5v1B5Qq6yDazDwfYrcXpZO'
                    },
                   
                ]
            }
        }
        mock_sp_track.return_value = {'id': '5v1B5Qq6yDazDwfYrcXpZO', 
            'album': {'id': '1jPOCIjCqYhzN4yVQhpeLB'}, 
            'artists': [{'id': '08BcOmBSaEW9ILEKc4MXvQ', 'name': 'Binnaz Sönmez Dursun'}],
            'name': 'Tuvalet Eğitimi Şarkısı'}
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

        # Mock Firestore query to simulate no existing track
        mock_query_stream = MagicMock()
        mock_db_collection.return_value.where.return_value.limit.return_value.stream = MagicMock(return_value=mock_query_stream)
        mock_query_stream.return_value = iter([])

        # Prepare a file-like object containing song names
        file_content = 'Tuvalet Eğitimi Şarkısı'.encode('utf-8')
        data = {
        'file': (io.BytesIO(file_content), 'test_file.txt')
        }

        # Send POST request with the file
        response = self.client.post('http://localhost:8080/process_file', data=data, content_type='multipart/form-data')
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.data)
        self.assertTrue('results' in response_data)


if __name__ == '__main__':
    unittest.main()
