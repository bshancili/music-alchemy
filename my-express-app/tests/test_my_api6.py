import unittest
from unittest.mock import patch
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
    def test_process_file_no_file_provided(self, mock_db_collection, mock_sp_artist, mock_sp_audio_features, mock_sp_track, mock_sp_search):
        # No file is attached in the request
        response = self.client.post('http://localhost:8080/process_file')
        self.assertEqual(response.status_code, 400)
        response_data = json.loads(response.data)
        self.assertIn('error', response_data)
        self.assertEqual(response_data['error'], 'No file provided')

if __name__ == '__main__':
    unittest.main()
