from flask import Flask, request, jsonify
from spotipy import Spotify
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from spotipy.oauth2 import SpotifyClientCredentials
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1.base_query import FieldFilter

app = Flask(__name__)

# Replace these values with your Spotify API credentials
SPOTIPY_CLIENT_ID = '57e35b7900e2473eb2c8a3dc6b3e68ce'
SPOTIPY_CLIENT_SECRET = 'ee8e317543da4aa59bb351217a476e14'
client_credentials_manager = SpotifyClientCredentials(client_id=SPOTIPY_CLIENT_ID, client_secret=SPOTIPY_CLIENT_SECRET)
sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

# Firebase credentials and initialization
cred = credentials.Certificate('C:\\Users\\aycaaelifaktas\\OneDrive - sabanciuniv.edu\\Desktop\\CS308\\code\\ayca_backend\\music-alchemy\\my-express-app\\music-alchemy-firebase-adminsdk.json')
firebase_admin.initialize_app(cred)
db = firestore.client()




@app.route('/search_song', methods=['GET'])
def search_song():
    track_name = request.args.get('track_name')
    artist_name = request.args.get('artist_name')

    if not track_name or not artist_name:
        return jsonify({'error': 'Missing track_name or artist_name parameter'})

    # Search for the song in the Firestore database
    results = search_in_firestore(track_name, artist_name)

    return jsonify({'results': results})

def search_in_firestore(track_name, artist_name):
    # Perform a case-insensitive search in the 'Tracks' collection
    track_name_l = track_name.lower()
    artist_name_l = artist_name.lower()
    results = []

    tracks_ref = db.collection('Tracks')
    query_result = tracks_ref.where('lowercased_track_name', '==', track_name_l).where('lowercased_artists', 'array_contains', artist_name_l).limit(10).stream()

    for doc in query_result:
        track_data = doc.to_dict()
        results.append({
            'track_id': doc.id,
            'name': track_data['track_name'],
            'artist(s)': track_data['artists'],  
        })

    return results





@app.route('/autocomplete', methods=['GET'])
def autocomplete():
    query = request.args.get('song')

    if not query:
        return jsonify({'error': 'Missing song parameter'})

    # Search for tracks similar to the user's input
    suggestions = []
    tracks = []
    track_results = sp.search(q=query, type='track', limit=5)
    for track in track_results['tracks']['items']:
        tracks.append(track)

    # Extract relevant information about the tracks
    
    for track in tracks:
        
        artist_names = []
        for artist in track['artists']:
                artist_names.append(artist['name'])

        track_info = {
            'track_name': track['name'],
            'artist(s)': artist_names,
            'album_name': track['album']['name'],
        }
        suggestions.append(track_info)

    return jsonify({'suggestions': suggestions})





@app.route('/create_song', methods=['POST'])
def create_song():
    # Get the track name from the request body
    data = request.get_json()
    track_name = data.get('track_name')

    # Search for the track
    tracks = []
    track_results = sp.search(q=track_name, type='track', limit=1)
    for track in track_results['tracks']['items']:
        tracks.append(track)

 
    for track in tracks:
        # Extract relevant information about the track
        track_id=track['id']
        field = 'spotify_track_id'
        op = '=='
        value = track_id
        query = db.collection('Tracks')
        query = query.where(filter=FieldFilter(field, op, value)).limit(1)
        existing_track = query.stream()
        track_exists = len(list(existing_track)) > 0

        if not track_exists:

            album_id=track['album']['id']
            audio_features = sp.audio_features(track_id)
                
            artist_names = []
            artist_urls = []
            artist_ids =[]
            artist_images= []
                
                
            for artist in track['artists']:
                artist_names.append(artist['name'])
                artist_urls.append(artist['external_urls']['spotify'])
                artist_ids.append(artist['id'])
                

            for id in artist_ids:
                artist_info=sp.artist(id)
                for image_info in artist_info['images']:
                    artist_images.append(image_info)
                    
                
            track_data = {
                'album_type': track['album']['album_type'],
                'album_URL': track['album']['external_urls']['spotify'],
                'album_name': track['album']['name'],
                'album_release_date': track['album']['release_date'],
                'album_images':track['album']['images'],#array
                'spotify_album_id':album_id,
                'artists':artist_names, #array
                'artist_urls':artist_urls, #array
                'artist_images':artist_images,#array
                'spotify_artist_id(s)':artist_ids,#array
                'length_in_seconds':track['duration_ms']/1000,
                'spotify_track_id':track_id,
                'track_url':track['external_urls']['spotify'],
                'track_name':track['name'],
                'rating':0.0,
                'like_count':0,
                'rating_count':0,
                'added_at': firestore.SERVER_TIMESTAMP, 
                'acousticness':audio_features[0]['acousticness'],
                'danceability':audio_features[0]['danceability'],
                'energy':audio_features[0]['energy'], # Energy is a measure from 0.0 to 1.0 and represents a perceptual measure of intensity and activity
                'instrumentalness':audio_features[0]['instrumentalness'],
                'liveness':audio_features[0]['liveness'],  #is the track live
                'loudness':audio_features[0]['loudness'],
                'mode':audio_features[0]['mode'], # Major is represented by 1 and minor is 0
                'tempo':audio_features[0]['tempo'],# The overall estimated tempo of a track in beats per minute (BPM)
                'key':audio_features[0]['key'], # The key the track is in
                'valence':audio_features[0]['valence'] # Tracks with high valence sound more positive , while tracks with low valence sound more negative
            }
            db.collection('Tracks').add(track_data)
            return jsonify({'success': True, 'message': f'Song "{track_name}" saved to Firestore'})
            
        else:
            return jsonify({'fail': False, 'message': 'Track already exist in database'})

if __name__ == '__main__':
    app.run(debug=False, port=8080)
