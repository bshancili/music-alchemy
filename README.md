# music-alchemy

<br>**Project Leader**
<br>Baris Hancili - barishancili@sabanciuniv.edu

<br>**Backend Team**
<br>Ayça Aktaş - aycaaktas@sabanciuniv.edu
<br>Poyraz Güler - poyraz.guler@sabanciuniv.edu
<br>Maviş Buse Balcı - mavisbalci@sabanciuniv.edu

<br>**Web Team**
<br>Mert Kuleci - mkuleci@sabanciuniv.edu
<br>Emre Şimşek - emre.simsek@sabanciuniv.edu

<br>**Mobile Team**
<br>Can İnanır - can.inanir@sabanciuniv.edu
<br>Onuralp Devres - devres@sabanciuniv.edu
<br>Bartu Kaçar - bartukacar@sabanciuniv.edu



# Project Name

Brief project description and purpose.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Mobile App](#mobile-app)
  - [Introduction](#introductio1)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Backend](#backend)
  - [Introduction](#introductio2)
  - [Prerequisites](#prerequisites-1)
  - [Installation](#installation-1)
- [Web App](#web-app)
  - [Prerequisites, Introduction and Installation](#prerequisites-2,#introductio-3, #installation-2 )
 

---

## Overview

Music Alchemy is a music management and analysis platform that allows users to organize their music collection, rate songs, and receive personalized recommendations. Unlike traditional streaming services, Music Alchemy focuses on empowering users to curate their music experience without relying on continuous internet connectivity.


## Features

Data Format:
The core data format includes essential song information:

-Track name
-Performer(s)
-Album or media association
-User rating

Challenges addressed:

-Handling multiple performers for a track
-Unifying different versions of the same song across albums
-Basic properties like length, tempo, genre, mood (considered for future development)


Data Collection:
Music Alchemy supports various data input methods:

1-Manual User Input:
Users can manually input song information via a user-friendly web/mobile application interface.

2-Batch Input:
Users can upload .txt file, for batch input, ensuring consistency with the export functionality format.

3-Database Transfer:
Integration with cloud or self-hosted databases for seamless data import, assuming a schema consistent with the defined data format.

4-Rating:
Users can rate non-rated songs/albums/performer from the system.

5-External System Transfer:
Possibility to transfer song information from Spotify, handling data format incompatibilities.




Analysis of Musical Choices:
The system provides analyses presented through a dashboard:

-Statistical information about user preferences, filterable by date constraints.
-Display tables and charts based on predetermined criteria.
-Potential for user customization of analysis medium (considered for future development).



Recommendations:
Music Alchemy offers personalized recommendations:

-Based on user ratings at song/album/performer granularity.
-Temporal recommendations considering recent user activity.
-Friendship-driven recommendations with explanations of the source friend's identity.
-Possible transfer of recommendations from external sources like Spotify.


Additional Features:

Authentication:
Password-based authentication with optional third-party authenticators like Google.

Friends and Friendship:
Users can add friends, control the use of their activity in recommendation analysis, and optionally form friend groups for common liking analysis.

Result Sharing:
Users can share analysis results on social media platforms.

Data Exporting:
Export the current song ratings database with filtering options, such as exporting all ratings for a single performer.

App Integrations:
Users can connect their profiles to third-party application like Spotify, for information collection and library integrations (considered for future development).

---

## Backend

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)

### Introduction

- [Node.js](https://nodejs.org/)
- [Firebase CLI](https://firebase.google.com/docs/cli)

## Installation

Follow these instructions to get your project up and running on your local machine for development and testing purposes.

### Prerequisites

What you need to install and how to install them:

- Node.js: [Download & Installation Guide](https://nodejs.org/en/download/)
- npm: Comes installed with Node.js
- pip: python
- Flask
  
### Setup

1. Clone the repo:
git clone https://github.com/bshancili/music-alchemy.git

2. Navigate to the project directory:
cd /music-alchemy/my-express-app

3. Install NPM packages:
npm install

4. Install pip packages:
pip install Flask
pip install spotipy
pip install flask.admin

### Usage

After installation run the servers for both api(s)python.py and server.js. For python file you can enter "python -m flask" and for nodejs file you can enter "node server.js".This command starts the server on `localhost` at the default port (3000, or whatever is specified).

## API Endpoints

Below are the available API endpoints for the application:

- `POST /signup`: Registers a new user with email and password. Validates the password strength before registration.

- `POST /signin`: Authenticates a user with email and password. Uses Firebase Auth REST API for verification.

- `POST /search_songs`: Searches for songs based on provided track names and artist names. Queries the Firestore database for matching tracks.

- `POST /retrieve_user_tracks`: Retrieves a list of songs (rated and liked) associated with a specific user ID.

- `POST /recent_liked_songs`: Fetches the most recently liked songs of a user, based on a provided user ID.

- `POST /get_track_artist`: Retrieves the artist of a track based on the provided document ID from the Firestore database.

- `POST /find_song_name`: Finds the name of a song using its document ID in the Firestore database.

- `POST /retrieve_friend_list`: Retrieves the friend list of a user based on the provided user ID.

- `POST /get_privacy_value`: Gets the privacy setting (public or private) for a user based on the provided user ID.

- `POST /find_recommended_tracks`: Generates song recommendations based on a user's rated and liked songs using OpenAI's GPT model.

- `POST /temporal_recommendation`: Provides temporal recommendations based on recent user activity and preferences.

- `POST /friends_recommendation`: Offers song recommendations based on the user's and their friends' liked songs, considering privacy settings.

- `POST /process_file` (from `api(s)python.js`): Processes an uploaded file to suggest tracks, artists, and albums using Spotify's API.

Each endpoint serves a specific function in the application and interacts with different components like Firebase, Firestore, and external APIs like Spotify and OpenAI.

## Web App

Prequsities, Installation, Configuration and Running the App:

1- Clone the Repository
Open your terminal and run the following command to clone the Music Alchemy repository:

git clone https://github.com/your-username/music-alchemy.git


2-Navigate to the Project Directory:
Move into the Music Alchemy project directory:

cd music-alchemy


3-Install Dependincies:
Run the following command to install the project dependencies using npm:

npm install
This will download and install all the required packages specified in the package.json file.


4-Configure the Database
Music Alchemy might require a database for storing song information. Refer to the project documentation or configuration files to set up the database connection.


5- Environment Variables:
Check if there are any required environment variables that need to be set. This information is usually provided in a .env file. If there isn't one, you might need to create it based on the project's configuration.


6- Run the Application:
Once the dependencies are installed, you can start the application:
npm start

This command will start the Node.js application. Open your web browser and go to http://localhost:3000 to access Music Alchemy.

7-Explore and Enjoy:

You've successfully deployed Music Alchemy! Explore the features and functionalities. If you encounter any issues, refer to the project's documentation or troubleshoot based on error messages.


