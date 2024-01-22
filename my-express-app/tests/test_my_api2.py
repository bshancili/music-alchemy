import unittest
from unittest.mock import patch
from flask import json
from apispython import app  

class TestAutocompleteAPI(unittest.TestCase):

    def setUp(self):
        app.testing = True
        self.client = app.test_client()

    @patch('apispython.sp.search')  
    def test_autocomplete(self, mock_search):
        # Mock Spotify search response
        mock_search.return_value = {
            'tracks': {
                'items': [
                    {
                        'name': 'Beautiful Girls ',
                        'artists': [{'name': 'Sean Kingston'}],
                        'album': {'name': 'Beautiful Girls', 'images': [{'url': 'https://i.scdn.co/image/ab67616d0000b2736a45d20e414fbc456ecea553'}, {'url': 'https://i.scdn.co/image/ab67616d000048516a45d20e414fbc456ecea553'}]},
                        'id': 'spotify_track_id_1'
                    },
                   
                ]
            }
        }

        # Test autocomplete with valid query
        response = self.client.get('http://localhost:8080/autocomplete?song=beatiful')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('suggestions', data)
        self.assertEqual(len(data['suggestions']), 1)  # Adjust number based on your mock data

        # Test autocomplete with missing query
        response = self.client.get('http://localhost:8080/autocomplete')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'Missing song parameter')

if __name__ == '__main__':
    unittest.main()
