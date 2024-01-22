import unittest
import requests
from unittest.mock import patch
from apispython import app 
from unittest.mock import MagicMock


class TestMyAPI(unittest.TestCase):


    def setUp(self):
        app.testing = True
        self.client = app.test_client()



    @patch('apispython.sp.search')  # Replace 'your_module_name' with the actual name of your module
    @patch('apispython.db.collection')

    def test_search_api(self, mock_db_collection, mock_sp_search):
        # Mocking Spotify Search Response
        mock_sp_search.return_value = {
            'tracks': {
                'items': [
                    {'id': '3fVnlF4pGqWI9flVENcT28'}
                ]
            }
        }

        # Mock Firestore Query
        mock_query = mock_db_collection.return_value.where.return_value.limit.return_value.stream
        mock_query.return_value = iter([type('', (), {'id': 'SrItk7ih6fLPuhFYec7J'})()])

        # Test for successful response
        response = self.client.get("http://localhost:8080/search?songName=wildest dreams")
        self.assertEqual(response.status_code, 200)
        self.assertIn('SrItk7ih6fLPuhFYec7J', response.json.get('matchingTrackIds', []))

        # Test for no matching documents
        mock_query.return_value = iter([])  # No matches in Firestore
        response = self.client.get("http://localhost:8080/search?songName=kkljkıom")
        self.assertEqual(response.status_code, 404)
        self.assertIn('No matching documents found.', response.json.get('error', ''))

        # Test for missing song name parameter
        response = self.client.get("http://localhost:8080/search")
        self.assertEqual(response.status_code, 400)
        self.assertIn('Song name parameter is required.', response.json.get('error', ''))





if __name__ == '__main__':
    unittest.main()





