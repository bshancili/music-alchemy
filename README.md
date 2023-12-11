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
  - [Prerequisites](#prerequisites-2)
  - [Introduction](#introductio-3)
  - [Installation](#installation-2)

---

## Overview

Provide an overview of the project, its goals, and key features.

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

### Introduction

- [Node.js](https://nodejs.org/)
- [Firebase CLI](https://firebase.google.com/docs/cli)

### Prerequisites



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


