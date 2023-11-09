//Package and imports
package com.cs308.musicalchemy
import android.app.Activity
import android.app.Application
import android.content.ContentValues.TAG
import androidx.compose.foundation.layout.Column
import androidx.compose.material.Button
import androidx.compose.material.Text
import androidx.compose.material.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.activity.ComponentActivity
import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.google.firebase.FirebaseApp
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.sp
import androidx.compose.material.MaterialTheme
import androidx.compose.material.lightColors
import androidx.compose.ui.graphics.Color
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Settings
import androidx.compose.ui.res.stringResource
import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.navigation.NavType
import androidx.navigation.navArgument
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import androidx.compose.runtime.livedata.observeAsState
import android.content.Intent
import androidx.activity.result.ActivityResult
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewmodel.compose.viewModel
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.tasks.Task
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.PropertyName



//~~~~~~~~~~
// Placeholder data classes

data class UserData(val displayName: String, val email: String, val profilePictureUrl: String)
data class FriendData(val displayName: String, val profilePictureUrl: String)


//~~~~~~~~~~
//~~~~~THEME~~~~~
//Design colors, App theme and Logo
val PastelButtermilk = Color(0xFFF9FBE7)
val PastelLavender = Color(0xFFCEB2FC)

private val appThemeColors = lightColors(
    primary = PastelLavender,
    primaryVariant = PastelLavender,
    secondary = PastelLavender,

    background = PastelButtermilk,
    surface = PastelLavender,
)

@Composable
fun AppTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colors = appThemeColors,
        typography = MaterialTheme.typography,
        shapes = MaterialTheme.shapes,
        content = content
    )
}

@Composable
fun Logo(modifier: Modifier = Modifier) {
    val typography = MaterialTheme.typography
    Text(
        text = "MUSIC ALCHEMY",
        style = typography.h3.copy(
            color = MaterialTheme.colors.primaryVariant,
            fontFamily = FontFamily(Font(R.font.my_custom_font)),
            fontSize = 42.sp
        ),
        modifier = modifier
    )
}


//~~~~~~~~~~
//~~~~~MAIN APP~~~~~
//Main App, Main Activity, App

class MainApp : Application() {
    override fun onCreate() {

        if (FirebaseApp.getApps(this).isEmpty()) {
            FirebaseApp.initializeApp(this)
            Log.d("MainApp", "Firebase initialized")
        }
        else {
            Log.d("MainApp", "Firebase already initialized")
        }
        super.onCreate()
    }

}

class MainActivity : ComponentActivity() {
    private lateinit var googleSignInClient: GoogleSignInClient
    private lateinit var authResultLauncher: ActivityResultLauncher<Intent>

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        configureGoogleSignIn()
        authResultLauncher = registerForActivityResult(
            ActivityResultContracts.StartActivityForResult()
        ) { result: ActivityResult ->
            if (result.resultCode == Activity.RESULT_OK) {
                val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
                handleSignInResult(task)
            }
        }
        setContent {
            AppTheme {
                App(::startGoogleSignIn)
            }
        }
    }


    private fun configureGoogleSignIn() {
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(getString(R.string.default_web_client_id))
            .requestEmail()
            .build()
        googleSignInClient = GoogleSignIn.getClient(this, gso)
    }

    private fun startGoogleSignIn() {
        val signInIntent = googleSignInClient.signInIntent
        authResultLauncher.launch(signInIntent)
    }

    private fun handleSignInResult(completedTask: Task<GoogleSignInAccount>) {
        try {
            val account = completedTask.getResult(ApiException::class.java)
            firebaseAuthWithGoogle(account.idToken!!)
        } catch (e: ApiException) {
            Log.w(TAG, "signInResult:failed code=" + e.statusCode)
            // Update UI accordingly
        }
    }
    private fun firebaseAuthWithGoogle(idToken: String) {
        val credential = GoogleAuthProvider.getCredential(idToken, null)
        FirebaseAuth.getInstance().signInWithCredential(credential)
            .addOnCompleteListener(this) { task ->
                if (task.isSuccessful) {
                    // Sign in success, update UI with the signed-in user's information
                    Log.d(TAG, "signInWithCredential:success")
                //TODO: save user for later
                //val user = FirebaseAuth.getInstance().currentUser


                    // TODO: Navigate to the next screen or update the UI
                } else {
                    // If sign in fails, display a message to the user.
                    Log.w(TAG, "signInWithCredential:failure", task.exception)
                    // TODO: Update UI to show sign-in failed
                }
            }
    }




}

@Composable
fun App(startGoogleSignIn: () -> Unit) {
    val navController = rememberNavController()
    NavHost(navController, startDestination = "initialMenu") {
        composable("initialMenu") { InitialMenu(navController, startGoogleSignIn) }
        composable("login") { LoginScreen(navController) }
        composable("mainMenu") { MainMenu(navController) }
        composable("signUp") { SignUpScreen(navController) }
        composable("profile") { ProfileScreen(navController) }
        composable("settings") { SettingsScreen() }
        composable("profile/{friendName}", arguments = listOf(navArgument("friendName") { type = NavType.StringType })) { backStackEntry ->
            val friendName = backStackEntry.arguments?.getString("friendName")
            FriendProfileScreen(friendName = friendName ?: "Unknown") // Replace with a real composable that displays the friend's profile
        }
        composable("songs") { SongListScreen(navController) }
        composable("songDetail/{songId}", arguments = listOf(navArgument("songId") { type = NavType.StringType })) { backStackEntry ->
            SongDetailScreen(songId = backStackEntry.arguments?.getString("songId") ?: "")
        }
    }
}


//~~~~~~~~~~
//~~~~~AUTHENTICATION~~~~~
//Initial Menu, SignUp, Login

@Composable
fun InitialMenu(navController: NavController, startGoogleSignIn: () -> Unit) {
    Column(
        modifier = Modifier
            .background(color = MaterialTheme.colors.background)
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Logo()
        Button(
            colors = ButtonDefaults.buttonColors(backgroundColor = MaterialTheme.colors.secondary),
            onClick = { navController.navigate("login") },
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp)
        ) {
            Text(text = "Log in")
        }
        Button(
            colors = ButtonDefaults.buttonColors(backgroundColor = MaterialTheme.colors.secondary),
            onClick = { navController.navigate("signUp") },
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp)
        ) {
            Text(text = "Sign up")
        }

        //Icons and buttons for apple/google sign in
        //TODO: add google / apple sign in when backend is ready
        Row(
            modifier = Modifier.padding(vertical = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Icon(
                painter = painterResource(id = R.drawable.ic_google),
                contentDescription = "Google sign-in",
                tint = Color.Unspecified,
                modifier = Modifier
                    .size(48.dp)
                    .clickable {
                        startGoogleSignIn()
                    }
                    .padding(vertical = 8.dp)
            )


            Icon(
                painter = painterResource(id = R.drawable.ic_apple),
                contentDescription = "Apple sign-in",
                tint = Color.Unspecified,
                modifier = Modifier
                    .size(48.dp) // Adjust the size as needed
                    .clickable {
                        // TODO: Implement Apple sign-in logic here
                        Log.d("InitialMenu", "Apple Sign-in button pressed")
                        //call a function to start the Apple sign-in process
                    }
                    .padding(vertical = 8.dp)
            )
        }



    }
}

@Composable
fun SignUpScreen(navController: NavController) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .background(color = MaterialTheme.colors.background)
            .fillMaxSize(),) {
        TextField(value = email, onValueChange = { email = it }, label = { Text("Email") })
        TextField(value = password, onValueChange = { password = it }, label = { Text("Password") })
        Button(
            colors = ButtonDefaults.buttonColors(backgroundColor = MaterialTheme.colors.secondary),
            onClick = {
                Log.d("SignUpScreen", "Attempting to sign up with email: $email")
                FirebaseAuthManager.signUp(email, password, object : Callback<SignUpResponse> {
                    override fun onResponse(call: Call<SignUpResponse>, response: Response<SignUpResponse>) {
                        if (response.isSuccessful) {
                            Log.d("SignUpScreen", "Sign up successful, navigating to login")
                            navController.navigate("login")
                        } else {
                            Log.d("SignUpScreen", "Sign up failed with response: $response")
                        }
                    }

                    override fun onFailure(call: Call<SignUpResponse>, t: Throwable) {
                        Log.e("SignUpScreen", "Sign up failed with error", t)
                    }
                })
            }) {
            Text(text = "Sign up")
        }
    }
}

@Composable
fun LoginScreen(navController: NavController) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .background(color = MaterialTheme.colors.background)
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    )  {
        TextField(value = email, onValueChange = { email = it }, label = { Text("Email") })
        TextField(value = password, onValueChange = { password = it }, label = { Text("Password") })
        Button(
            colors = ButtonDefaults.buttonColors(backgroundColor = MaterialTheme.colors.secondary),
            onClick = {
            Log.d("LoginScreen", "Attempting to sign in with email: $email")
            FirebaseAuthManager.signIn(email, password, object : Callback<SignInResponse> {
                override fun onResponse(call: Call<SignInResponse>, response: Response<SignInResponse>) {
                    if (response.isSuccessful) {
                        //sign-in success:
                        Log.d("LoginScreen", "Sign in successful, navigating to main menu")
                        navController.navigate("mainMenu")
                    } else {
                        // sign-in failed:
                        Log.w("LoginScreen", "Sign in failed with response: ${response.errorBody()?.string()}")
                    }
                }

                override fun onFailure(call: Call<SignInResponse>, t: Throwable) {
                    // Handle the failure case
                    Log.e("LoginScreen", "Sign in failed with error", t)
                }
            })
        }) {
            Text(text = "Log in")
        }
    }
}


//~~~~~~~~~~
////~~~~~MAIN MENU~~~~~

@Composable
fun MainMenu(navController: NavController) {
    val imagePainter = painterResource(id = R.drawable.profile_placeholder)


    //FOR FIREBASE LATER:
    /*if (userProfilePictureUrl != null) {


        rememberImagePainter(userProfilePictureUrl)
    } else {
        val imagePainter = painterResource(id = R.drawable.profile_placeholder)}

                if (userProfilePictureUrl != null) {
                Image(
                    painter = imagePainter,
                    contentDescription = stringResource(R.string.profile),
                    modifier = Modifier
                        .size(24.dp)
                        .clip(CircleShape)
                )
            } else {
       */




    Column(
        modifier = Modifier
            .background(color = MaterialTheme.colors.background)
            .fillMaxSize(),
    ) {

        Box(modifier = Modifier.fillMaxSize()) {
            Logo(
                modifier = Modifier
                    .align(Alignment.TopCenter)
                    .padding(top = 64.dp)
            )
            // Songs button
            Button(
                onClick = { navController.navigate("songs") },
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(16.dp)
            ) {
                Text(text = "All Songs List!", style = MaterialTheme.typography.button)
            }

           //Settings Icon
            IconButton(
                onClick = { navController.navigate("settings") },
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(16.dp)
            ) {
                Icon(
                    imageVector = Icons.Filled.Settings,
                    contentDescription = stringResource(R.string.settings)
                )
            }

            // Profile button on the top right
            IconButton(
                onClick = { navController.navigate("profile") },
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(16.dp)
            ) {
                Image(
                    painter = imagePainter,
                    contentDescription = stringResource(R.string.profile),
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                )

            }
        }
    }
}

@Composable
fun SettingsScreen() {
    // Settings screen UI elements
    Text(text = "Settings", style = MaterialTheme.typography.h4)
    //TODO: Add different settings options here
}


//~~~~~~~~~~
//~~~~~PROFILE~~~~~

@Composable
fun ProfileScreen(navController: NavController) {
    // Placeholder user data
    val userData = UserData(
        displayName = "Sucuklu Yumurta",
        email = "test12@gmail.com (placeholder, will call email from database later)",
        profilePictureUrl = "https://via.placeholder.com/150" // URL for a placeholder image
    )

    // Placeholder list of friends
    val friendsList = listOf(
        // Assume FriendData is a data class containing friend information
        FriendData("Chicken Nugget", "https://via.placeholder.com/150"),
        FriendData("AAAAAAAAAAA", "https://via.placeholder.com/150"),
        // Add more friends as needed
    )

    Column(modifier = Modifier
        .background(color = MaterialTheme.colors.background)) {
        ProfileHeader(userData)
        Divider()
        FriendsList(friendsList, navController)
    }
}

@Composable
fun ProfileHeader(userData: UserData) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Profile picture
        Image(
            painter = painterResource(id = R.drawable.profile_placeholder), // Replace with userData.profilePictureUrl when loading images from the web
            contentDescription = "Profile Picture",
            modifier = Modifier
                .size(72.dp)
                .clip(CircleShape)
        )

        Spacer(modifier = Modifier.width(16.dp))

        // User information
        Column {
            Text(
                text = userData.displayName,
                style = MaterialTheme.typography.h6,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Text(
                text = userData.email,
                style = MaterialTheme.typography.body2,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}


//~~~~~~~~~~
//~~~~~FRIENDS LIST/PROFILE~~~~~

@Composable
fun FriendsList(friends: List<FriendData>, navController: NavController) {
    LazyColumn {
        items(friends) { friend ->
            FriendItem(friend, navController)
        }
    }
}

@Composable
fun FriendItem(friend: FriendData, navController: NavController) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable {
                // On click, navigate to the friend's profile
                // This will be updated to pass the friend's user ID or other identifier to the navController
                navController.navigate("profile/${friend.displayName}")
            }
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Friend profile picture
        Image(
            painter = painterResource(id = R.drawable.profile_placeholder), // Replace with friend.profilePictureUrl when loading images from the web
            contentDescription = "Friend Profile Picture",
            modifier = Modifier
                .size(48.dp)
                .clip(CircleShape)
        )

        Spacer(modifier = Modifier.width(16.dp))

        // Friend name
        Text(
            text = friend.displayName,
            style = MaterialTheme.typography.subtitle1
        )



    }
}

@Composable
fun FriendProfileScreen(friendName: String) {
    Column(modifier = Modifier.fillMaxSize().background(color = MaterialTheme.colors.background)) {

        // Display the friend's profile information here
        // For now, just displays the friend's name
        Text(text = "Profile of $friendName", style = MaterialTheme.typography.h4)
        // ... Add more UI elements as needed
    }

}


//~~~~~~~~~~
//~~~~~~~~~~SONGS~~~~~~~~~~
//Song, SongViewModel, SongListScreen, SongListItem, SongDetailScreen

data class Song(
    // Assuming 'id' does not need annotation, matches the field name in Firestore.
    var id: String = "",

    @get:PropertyName("acousticness_%") @set:PropertyName("acousticness_%") var acousticnessPercent: Int? = 0,
    @get:PropertyName("artist(s)_name") @set:PropertyName("artist(s)_name") var artistsName: String? = "",
    val artistCount: Int? = 0,
    val bpm: Int? = 0,
    @get:PropertyName("danceability_%") @set:PropertyName("danceability_%") var danceabilityPercent: Int? = 0,
    @get:PropertyName("energy_%") @set:PropertyName("energy_%") var energyPercent: Int? = 0,
    @get:PropertyName("instrumentalness_%") @set:PropertyName("instrumentalness_%") var instrumentalnessPercent: Int? = 0,
    val key: String? = "",
    @get:PropertyName("liveness_%") @set:PropertyName("liveness_%") var livenessPercent: Int? = 0,
    val mode: String? = "",
    @get:PropertyName("released_year") @set:PropertyName("released_year") var releasedYear: Int? = 0,
    @get:PropertyName("speechiness_%") @set:PropertyName("speechiness_%") var speechinessPercent: Int? = 0,
    val streams: Long? = 0L,
    @get:PropertyName("track_name") @set:PropertyName("track_name") var trackName: String? = "",
    @get:PropertyName("valence_%") @set:PropertyName("valence_%") var valencePercent: Int? = 0
)

class SongsViewModel : ViewModel() {
    private val _songs = MutableLiveData<List<Song>>()
    val songs: LiveData<List<Song>> = _songs

    init {
        loadSongs()
    }

    private fun loadSongs() {
        val db = FirebaseFirestore.getInstance()
        db.collection("Songs") // The name of collection in Firestore
            .get()
            .addOnSuccessListener { documents ->
                val songsList = documents.mapNotNull { documentSnapshot ->
                    documentSnapshot.toObject(Song::class.java).apply {
                        id = documentSnapshot.id // Set the id property to the document ID
                    }
                }
                Log.d("SongsViewModel", "Songs loaded: ${songsList.size}")
                _songs.value = songsList
            }
            .addOnFailureListener { exception ->
                Log.e("SongsViewModel", "Error loading songs", exception)
            }
    }
}

@Composable
fun SongListScreen(navController: NavController, viewModel: SongsViewModel = viewModel()) {
    val songs by viewModel.songs.observeAsState(initial = emptyList())

    if (songs.isEmpty()) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
    } else {
        LazyColumn {
            items(songs) { song ->
                SongListItem(song) {
                    Log.d("SongDetailViewer", "Attempting to view song: ${song.id}")
                    navController.navigate("songDetail/${song.id}")

                }
            }
        }
    }
}

@Composable
fun SongListItem(song: Song, onClick: () -> Unit) {
    Column(
        modifier = Modifier
            .clickable(onClick = onClick)
            .padding(8.dp)
            .fillMaxWidth()
    ) {
        Text(song.trackName ?: "Unknown", style = MaterialTheme.typography.h6)
        Text("${song.artistsName ?: "Unknown Artist"} • ${song.releasedYear ?: "Year Unknown"}", style = MaterialTheme.typography.subtitle1)
        Text("Streams: ${song.streams ?: "Not available"}", style = MaterialTheme.typography.body2)
    }
    Divider()
}

@Composable
fun SongDetailScreen(songId: String, viewModel: SongsViewModel = viewModel()) {
    val songs by viewModel.songs.observeAsState(initial = emptyList())
    val song = songs.firstOrNull { it.id == songId }

    song?.let { songDetail ->
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Track Name: ${songDetail.trackName ?: "Unknown"}", style = MaterialTheme.typography.h5)
            Text("Artist(s) Name: ${songDetail.artistsName ?: "Unknown Artist"}", style = MaterialTheme.typography.subtitle1)
            Text("Artist Count: ${songDetail.artistCount ?: "Unknown"}", style = MaterialTheme.typography.subtitle1)
            Text("BPM: ${songDetail.bpm ?: "Unknown"}", style = MaterialTheme.typography.body1)
            Text("Danceability: ${songDetail.danceabilityPercent ?: "Unknown"}%", style = MaterialTheme.typography.body1)
            Text("Energy: ${songDetail.energyPercent ?: "Unknown"}%", style = MaterialTheme.typography.body1)
            Text("Instrumentalness: ${songDetail.instrumentalnessPercent ?: "Unknown"}%", style = MaterialTheme.typography.body1)
            Text("Key: ${songDetail.key ?: "Unknown"}", style = MaterialTheme.typography.body1)
            Text("Liveness: ${songDetail.livenessPercent ?: "Unknown"}%", style = MaterialTheme.typography.body1)
            Text("Mode: ${songDetail.mode ?: "Unknown"}", style = MaterialTheme.typography.body1)
            Text("Released Year: ${songDetail.releasedYear ?: "Year Unknown"}", style = MaterialTheme.typography.body1)
            Text("Speechiness: ${songDetail.speechinessPercent ?: "Unknown"}%", style = MaterialTheme.typography.body1)
            Text("Streams: ${songDetail.streams ?: "Not available"}", style = MaterialTheme.typography.body1)
            Text("Valence: ${songDetail.valencePercent ?: "Unknown"}%", style = MaterialTheme.typography.body1)
        }
    } ?:Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        CircularProgressIndicator()
    }
}