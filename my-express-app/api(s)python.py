from flask import Flask, request, jsonify
from spotipy import Spotify
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from spotipy.oauth2 import SpotifyClientCredentials
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1.base_query import FieldFilter
from datetime import datetime
import os
from flask_cors import CORS


app = Flask(__name__)
CORS(app)


# Replace these values with your Spotify API credentials
SPOTIPY_CLIENT_ID = '57e35b7900e2473eb2c8a3dc6b3e68ce'
SPOTIPY_CLIENT_SECRET = 'ee8e317543da4aa59bb351217a476e14'
client_credentials_manager = SpotifyClientCredentials(client_id=SPOTIPY_CLIENT_ID, client_secret=SPOTIPY_CLIENT_SECRET)
sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

# Firebase credentials and initialization
base_dir = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(base_dir, 'music-alchemy-firebase-adminsdk.json')
cred = credentials.Certificate(json_path)

firebase_admin.initialize_app(cred)
db = firestore.client()


def search_and_match(song_name):
    try:
       
        # Search for tracks on Spotify
        spotify_tracks_results = sp.search(q=song_name, type='track', limit=20)

        spotify_tracks=spotify_tracks_results['tracks']['items']

        # Reference to Firestore database
        tracks_ref = db.collection('Tracks')

        # Find matching documents in Firestore based on Spotify IDs
        matching_track_ids = []
        for spotify_track in spotify_tracks:

            spotify_id = spotify_track['id']
            field = 'spotify_track_id'
            op = '=='
            value = spotify_id
            query = tracks_ref.where(filter=FieldFilter(field, op, value)).limit(1)
            existing_tracks = query.stream()

            # Convert the generator to a list and check if it's not empty
            existing_tracks_list = list(existing_tracks)
            if existing_tracks_list:
                 matching_track_ids.append(existing_tracks_list[0].id)


        return matching_track_ids

    except Exception as e:
        print(f"Error: {e}")
        return []


@app.route('/search', methods=['GET'])
def search():
    try:
        song_name = request.args.get('songName')

        if not song_name:
            return jsonify({'error': 'Song name parameter is required.'}), 400

        matching_ids = search_and_match(song_name)

        if matching_ids:
            return jsonify({'matchingTrackIds': matching_ids})
        else:
            return jsonify({'error': 'No matching documents found.'}), 404

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Internal server error.'}), 500



@app.route('/autocomplete', methods=['GET'])
def autocomplete():
    query = request.args.get('song')

    if not query:
        return jsonify({'error': 'Missing song parameter'})

    # Search for tracks similar to the user's input
    suggestions = []
    track_results = sp.search(q=query, type='track', limit=10)
    tracks = track_results['tracks']['items']

    # Extract relevant information about the tracks
    
    for track in tracks:
        
        artist_names = []
        for artist in track['artists']:
                artist_names.append(artist['name'])

        track_info = {
            'track_name': track['name'],
            'artist(s)': artist_names,
            'album_name': track['album']['name'],
            'album_images':track['album']['images'],
            'spotify_track_id':track['id']
        }
        suggestions.append(track_info)

    return jsonify({'suggestions': suggestions})





@app.route('/create_song', methods=['POST'])
def create_song():
    # Get the track name from the request body
    data = request.get_json()
    track_spotify_id = data.get('track_spotify_id')
    user_id = data.get('userid')

    # Search for the track

    track = sp.track(track_spotify_id)
    

 
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
                    
        lowercased_track_name = track['name'].lower()   
        lower_artists=[]
        for artist in artist_names:
                    artist_lower = artist.lower() 
                    lower_artists.append(artist_lower) 

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
            'lowercased_artists': lower_artists,
            'lowercased_track_name': lowercased_track_name,
            'rating':0.0,
            'comments':[],
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
        song_ref = db.collection('Tracks').add(track_data)
        new_song_id = song_ref[1].id

        user_ref = db.collection('Users').document(user_id)
        song_ref1 = db.collection('Tracks').document(new_song_id)

        # Retrieve the current arrays
        liked_song_map = user_ref.get().to_dict().get('liked_song_list', {})
        created_songs_map = user_ref.get().to_dict().get('created_songs', {})
        

        # Check if new_song_id is not already in the arrays
        if new_song_id not in liked_song_map:
            liked_song_map[new_song_id] = {'timestamp': datetime.utcnow()}
        if new_song_id not in created_songs_map:
            created_songs_map[new_song_id] =  {'timestamp': datetime.utcnow()}

        # Update the arrays in Firestore
        user_ref.update({
        'liked_song_list': liked_song_map,
        'created_songs': created_songs_map,
        })

        song_ref1.update({
        'like_count': firestore.Increment(1),  # Increment by one
        'firebase_id':new_song_id
        })

        return jsonify({'success': True, 'message': f'Song "{track["name"]}" saved to Firestore'})
            
    else:
        return jsonify({'success': False, 'message': 'Track already exist in database'})





@app.route('/process_file', methods=['POST'])
def process_file():
    file = request.files.get('file')
    userid = request.form.get('userid')
    if file is None:
        return jsonify({'error': 'No file provided'}), 400

    
    # Read the contents of the file
    file_contents = file.read().decode('utf-8').splitlines()

    suggestions_results = []

    for song in file_contents:
        # 1. Autocomplete API
        track_results = sp.search(q=song, type='track', limit=1)
        tracks = track_results['tracks']['items']
        
        for track in tracks:
            suggested_track_name = track['name']
            artist_names = []
            for artist in track['artists']:
                    artist_names.append(artist['name'])

            # 2. Create Song API
            spotify_track_id = track['id']
            create_song_response = create_song_internal({'track_spotify_id': spotify_track_id, 'userid': userid})

            # Collect suggestions for the current song
            suggestions = {
                'song_entered': song,
                'suggested_track_name': suggested_track_name,
                'suggested_artist(s)':artist_names,
                'suggested_album_name':track['album']['name'],
                'album_images':track['album']['images'],
                'create_song_response': create_song_response
            }

            suggestions_results.append(suggestions)

    return jsonify({'results': suggestions_results})


def create_song_internal(data):
    # Function to handle song creation
    track_spotify_id = data.get('track_spotify_id')
    user_id = data.get('userid')
    
    # Search for the track
    track = sp.track(track_spotify_id)

    track_id = track['id']
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
                    
        lowercased_track_name = track['name'].lower()   
        lower_artists=[]
        for artist in artist_names:
                    artist_lower = artist.lower() 
                    lower_artists.append(artist_lower) 

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
            'lowercased_artists': lower_artists,
            'lowercased_track_name': lowercased_track_name,
            'rating':0.0,
            'comments':[],
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
        song_ref = db.collection('Tracks').add(track_data)
        new_song_id = song_ref[1].id

        user_ref = db.collection('Users').document(user_id)
        song_ref1 = db.collection('Tracks').document(new_song_id)

        # Retrieve the current arrays
        liked_song_map = user_ref.get().to_dict().get('liked_song_list', {})
        created_songs_map = user_ref.get().to_dict().get('created_songs', {})
        

        # Check if new_song_id is not already in the arrays
        if new_song_id not in liked_song_map:
            liked_song_map[new_song_id] = {'timestamp': datetime.utcnow()}
        if new_song_id not in created_songs_map:
            created_songs_map[new_song_id] =  {'timestamp': datetime.utcnow()}

        # Update the arrays in Firestore
        user_ref.update({
        'liked_song_list': liked_song_map,
        'created_songs': created_songs_map,
        })

        song_ref1.update({
        'like_count': firestore.Increment(1), # Increment by one
        'firebase_id':new_song_id
        })

        return {'success': True, 'message': f'Song "{track["name"]}" saved to Firestore'}

    else:
        return {'success': False, 'message': 'Track already exists in the database'}



if __name__ == '__main__':
    app.run(debug=False, port=8080)