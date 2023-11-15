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
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.Edit
import androidx.compose.ui.res.stringResource
import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.painterResource
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.LaunchedEffect
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewmodel.compose.viewModel
import com.cs308.musicalchemy.AuthStateManager.isAuthenticated
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.tasks.Task
import com.google.firebase.Firebase
import com.google.firebase.auth.auth
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.Timestamp
import com.google.firebase.firestore.FieldPath
import com.google.firebase.firestore.PropertyName

import com.google.firebase.firestore.firestore
import kotlinx.coroutines.tasks.await


//~~~~~~~~~~
// Placeholder data classes




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
object AuthStateManager {
    var isAuthenticated = mutableStateOf(false)
}

class MainActivity : ComponentActivity() {
    private lateinit var googleSignInClient: GoogleSignInClient
    private lateinit var authResultLauncher: ActivityResultLauncher<Intent>
    private lateinit var auth: FirebaseAuth
    private lateinit var authStateListener: FirebaseAuth.AuthStateListener

    override fun onStart() {
        super.onStart()
        authStateListener = FirebaseAuth.AuthStateListener { firebaseAuth ->
            isAuthenticated.value = firebaseAuth.currentUser != null
        }
        auth.addAuthStateListener(authStateListener)
    }

    override fun onStop() {
        super.onStop()
        if (::authStateListener.isInitialized) {
            auth.removeAuthStateListener(authStateListener)
        }
    }
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        auth = FirebaseAuth.getInstance()
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
        Log.d(TAG, "configureGoogleSignIn called")
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(getString(R.string.default_web_client_id)) // Get this value from the Google Cloud Console
            .requestEmail()
            .build()
        googleSignInClient = GoogleSignIn.getClient(this, gso)
    }

    private fun startGoogleSignIn() {
        Log.d(TAG, "startGoogleSignIn called")
        val signInIntent = googleSignInClient.signInIntent
        authResultLauncher.launch(signInIntent)
    }

    private fun handleSignInResult(completedTask: Task<GoogleSignInAccount>) {
        Log.d("MainApp", "handleSignInResult called")
        try {
            Log.d("MainApp", "ITS WORKING")
            val account = completedTask.getResult(ApiException::class.java)
            Log.d("MainApp", "LET HIM COOK")
            firebaseAuthWithGoogle(account.idToken!!)
            Log.d("MainApp", "YOOOOOOOOOOOOOO")
        } catch (e: ApiException) {
            Log.w(TAG, "Google sign in failed", e)
        }
    }


    private fun firebaseAuthWithGoogle(idToken: String) {
        val credential = GoogleAuthProvider.getCredential(idToken, null)
        auth.signInWithCredential(credential)
            .addOnCompleteListener(this) { task ->
                if (task.isSuccessful) {
                    isAuthenticated.value = true
                    Log.d(TAG, "signInWithCredential:success")
                } else {
                    Log.w(TAG, "signInWithCredential:failure", task.exception)
                }
            }
    }

}






@Composable
fun App(startGoogleSignIn: () -> Unit) {
    val navController = rememberNavController()
    val isAuthenticated = AuthStateManager.isAuthenticated

    LaunchedEffect(key1 = isAuthenticated.value) {
        if (isAuthenticated.value) {
            navController.navigate("mainMenu") {
                popUpTo("initialMenu") { inclusive = true }
            }
        }
    }

    MainActivity()
    NavHost(navController, startDestination = "initialMenu") {
        composable("initialMenu") { InitialMenu(navController, startGoogleSignIn) }
        composable("login") { LoginScreen(navController) }
        composable("mainMenu") { MainMenu(navController) }
        composable("screen1") { Screen1(navController) }
        composable("screen2") { Screen2(navController) }
        composable("addSong") { AddSongScreen(navController) }
        composable("signUp") { SignUpScreen(navController) }
        composable("profile") { ProfileScreen(navController) }
        composable("settings") { SettingsScreen(navController) }
        composable(
            "profile/{userId}",
            arguments = listOf(navArgument("userId") { type = NavType.StringType })
        ) { backStackEntry ->
            val userId = backStackEntry.arguments?.getString("userId") ?: return@composable
            FriendProfileScreen(userId, navController)
        }
        composable("songs") { SongListScreen(navController) }
        composable("songDetail/{songId}", arguments = listOf(navArgument("songId") { type = NavType.StringType })) { backStackEntry ->
            SongDetailScreen(songId = backStackEntry.arguments?.getString("songId") ?: "")
        }
        composable("likedSongs") { LikedSongsScreen(navController) }
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
                        Log.d(TAG, "button pressed; calling start-google-signin")
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
                        Log.d("InitialMenu", "Apple Sign-in button pressed")
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
    val auth = FirebaseAuth.getInstance()

    Column(
        modifier = Modifier
            .background(color = MaterialTheme.colors.background)
            .fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        )
    {
        TextField(value = email, onValueChange = { email = it }, label = { Text("Email") })
        TextField(value = password, onValueChange = { password = it }, label = { Text("Password") })
        Spacer(modifier = Modifier.height(16.dp))
        Button(
            onClick = {
                auth.createUserWithEmailAndPassword(email, password)
                    .addOnCompleteListener { task ->
                        if (task.isSuccessful) {
                            // Sign up success, update UI with the user's information
                            Log.d("SignUpScreen", "createUserWithEmail:success")
                            navController.navigate("login")
                        } else {
                            // If sign up fails, display a message to the user.
                            Log.w("SignUpScreen", "createUserWithEmail:failure", task.exception)
                        }
                    }
            }
        ) {
            Text(text = "Sign up")
        }
    }
}
@Composable
fun LoginScreen(navController: NavController) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    val auth = FirebaseAuth.getInstance()

    Column(
        modifier = Modifier
            .background(color = MaterialTheme.colors.background)
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        TextField(value = email, onValueChange = { email = it }, label = { Text("Email") })
        TextField(value = password, onValueChange = { password = it }, label = { Text("Password") })
        Spacer(modifier = Modifier.height(16.dp))
        Button(
            onClick = {
                auth.signInWithEmailAndPassword(email, password)
                    .addOnCompleteListener { task ->
                        if (task.isSuccessful) {
                            // Sign in success, update UI with the signed-in user's information
                            Log.d("LoginScreen", "signInWithEmail:success")
                            navController.navigate("mainMenu")
                        } else {
                            // If sign in fails, display a message to the user.
                            Log.w("LoginScreen", "signInWithEmail:failure", task.exception)
                        }
                    }
            }
        ) {
            Text(text = "Log in")
        }
    }
}



@Composable
fun CommonBottomBar(navController: NavController) {
    BottomNavigation {
        // Bottom Navigation Item for MainMenu
        BottomNavigationItem(
            icon = { Icon(Icons.Filled.Home, contentDescription = "Home") },
            label = { Text("Home") },
            selected = navController.currentDestination?.route == "mainMenu",
            onClick = {
                if (navController.currentDestination?.route != "mainMenu") {
                    navController.navigate("mainMenu")
                }
            }
        )

        // Bottom Navigation Item for Screen1
        BottomNavigationItem(
            icon = { Icon(Icons.Filled.Edit, contentDescription = "Screen1") },
            label = { Text("Screen1") },
            selected = navController.currentDestination?.route == "screen1",
            onClick = {
                if (navController.currentDestination?.route != "screen1") {
                    navController.navigate("screen1")
                }
            }
        )

        // Bottom Navigation Item for Screen2
        BottomNavigationItem(
            icon = { Icon(Icons.Filled.Build, contentDescription = "Screen2") },
            label = { Text("Screen2") },
            selected = navController.currentDestination?.route == "screen2",
            onClick = {
                if (navController.currentDestination?.route != "screen2") {
                    navController.navigate("screen2")
                }
            }
        )
    }
}


//~~~~~~~~~~
////~~~~~MAIN MENU~~~~~

@Composable
 fun MainMenu(navController: NavController) {

        val imagePainter = painterResource(id = R.drawable.profile_placeholder)

        Scaffold(
            bottomBar = { CommonBottomBar(navController) }
        ) { innerPadding ->
            Column(
                modifier = Modifier
                    .background(color = MaterialTheme.colors.background)
                    .fillMaxSize()
                    .padding(innerPadding),
            ) {
                Box(modifier = Modifier.fillMaxSize()) {
                    Logo(
                        modifier = Modifier
                            .align(Alignment.TopCenter)
                            .padding(top = 64.dp)
                    )

                    Button(
                        onClick = { navController.navigate("addSong") },
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .padding(bottom = 64.dp) // Adjust the padding as needed
                    ) {
                        Text(text = "Add Song!", style = MaterialTheme.typography.button)
                    }

                    // Songs button
                    Button(
                        onClick = { navController.navigate("songs") },
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .padding(bottom = 16.dp) // Adjust the padding as needed
                    ) {
                        Text(text = "All Songs List!", style = MaterialTheme.typography.button)
                    }
                    // Settings button
                    IconButton(
                        onClick = { navController.navigate("settings") },
                        modifier = Modifier
                            .align(Alignment.BottomStart)
                            .padding(start = 16.dp, bottom = 16.dp) // Adjust the padding as needed
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
    }




@Composable
fun Screen1(navController: NavController) {
    Scaffold(
        bottomBar = { CommonBottomBar(navController) }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding), // Apply the innerPadding here
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text("This is the Screen 1")
        }
    }
}


@Composable
fun Screen2(navController: NavController) {
    Scaffold(
        bottomBar = { CommonBottomBar(navController) }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding), // Apply the innerPadding here
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text("This is the Screen 2")
        }
    }
}



@Composable
fun AddSongScreen(navController: NavController, viewModel: SongsViewModel = viewModel()) {
    var trackName by remember { mutableStateOf("") }
    var artists by remember { mutableStateOf("") }
    var albumName by remember { mutableStateOf("") }
    var albumReleaseDate by remember { mutableStateOf("") }
    var albumType by remember { mutableStateOf("") }
    var danceability by remember { mutableStateOf("") }
    var energy by remember { mutableStateOf("") }
    var instrumentalness by remember { mutableStateOf("") }
    var key by remember { mutableStateOf("") }
    var lengthInSeconds by remember { mutableStateOf("") }
    var liveness by remember { mutableStateOf("") }
    var loudness by remember { mutableStateOf("") }
    var mode by remember { mutableStateOf("") }
    var tempo by remember { mutableStateOf("") }
    var valence by remember { mutableStateOf("") }
    val addSongStatus by viewModel.addSongStatus.observeAsState("")

    Scaffold(
        bottomBar = { CommonBottomBar(navController) }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(innerPadding)
                .padding(horizontal = 8.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            OutlinedTextField(value = trackName, onValueChange = { trackName = it }, label = { Text("Track Name") })
            OutlinedTextField(value = artists, onValueChange = { artists = it }, label = { Text("Artist(s)") })
            OutlinedTextField(value = albumName, onValueChange = { albumName = it }, label = { Text("Album Name") })
            OutlinedTextField(value = albumReleaseDate, onValueChange = { albumReleaseDate = it }, label = { Text("Album Release Date") })
            OutlinedTextField(value = albumType, onValueChange = { albumType = it }, label = { Text("Album Type") })
            OutlinedTextField(value = danceability, onValueChange = { danceability = it }, label = { Text("Danceability") })
            OutlinedTextField(value = energy, onValueChange = { energy = it }, label = { Text("Energy") })
            OutlinedTextField(value = instrumentalness, onValueChange = { instrumentalness = it }, label = { Text("Instrumentalness") })
            OutlinedTextField(value = key, onValueChange = { key = it }, label = { Text("Key") })
            OutlinedTextField(value = lengthInSeconds, onValueChange = { lengthInSeconds = it }, label = { Text("Length in Seconds") })
            OutlinedTextField(value = liveness, onValueChange = { liveness = it }, label = { Text("Liveness") })
            OutlinedTextField(value = loudness, onValueChange = { loudness = it }, label = { Text("Loudness") })
            OutlinedTextField(value = mode, onValueChange = { mode = it }, label = { Text("Mode") })
            OutlinedTextField(value = tempo, onValueChange = { tempo = it }, label = { Text("Tempo") })
            OutlinedTextField(value = valence, onValueChange = { valence = it }, label = { Text("Valence") })

            Button(onClick = {
                val newSong = Song(
                    trackName = trackName,
                    artists = artists.split(",").map { it.trim() },
                    albumName = albumName,
                    albumReleaseDate = albumReleaseDate,
                    albumType = albumType,
                    danceability = danceability.toDoubleOrNull(),
                    energy = energy.toDoubleOrNull(),
                    instrumentalness = instrumentalness.toDoubleOrNull(),
                    key = key.toIntOrNull(),
                    lengthInSeconds = lengthInSeconds.toDoubleOrNull(),
                    liveness = liveness.toDoubleOrNull(),
                    loudness = loudness.toDoubleOrNull(),
                    mode = mode.toIntOrNull(),
                    tempo = tempo.toDoubleOrNull(),
                    valence = valence.toDoubleOrNull()
                )
                viewModel.addSong(newSong)
            }) {
                Text("Add Song")
            }
            if (addSongStatus.isNotEmpty()) {
                Text(addSongStatus)
            }
        }
    }
}





@Composable
fun SettingsScreen(navController: NavController) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(text = "Settings", style = MaterialTheme.typography.h4)

        // Other settings options...

        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = {
                FirebaseAuth.getInstance().signOut() // Sign out from Firebase
                isAuthenticated.value = false // Set isAuthenticated to false
                navController.navigate("initialMenu") { // Navigate to initial menu
                    popUpTo(navController.graph.startDestinationId) {
                        inclusive = true // Remove all previous destinations from the back stack
                    }
                }
            },
            colors = ButtonDefaults.buttonColors(backgroundColor = MaterialTheme.colors.secondary)
        ) {
            Text(text = "Log Out")
        }
    }
}


//~~~~~~~~~~
//~~~~~PROFILE~~~~~


data class FriendData(
    val id: Any?,
    val name: String,
    val profilePictureUrl: String
)

@Composable
fun ProfileScreen(navController: NavController) {
    val viewModel: ProfileViewModel = viewModel()
    val friendsList by viewModel.friendsList.observeAsState(initial = emptyList())
    var newUsername by remember { mutableStateOf("") }
    val user = Firebase.auth.currentUser
    val currentUsername by viewModel.username.observeAsState("Unknown")
    val likedSongs by viewModel.likedSongs.observeAsState(initial = emptyList())
    LaunchedEffect(user?.uid) {
        viewModel.fetchUsername(user?.uid ?: "")
        viewModel.fetchLikedSongs(user?.uid ?: "")
    }

    Column(modifier = Modifier.padding(16.dp).fillMaxSize()) {
        // User's current username
        Text("Current Username: $currentUsername", style = MaterialTheme.typography.h6)

        // Input field for new username
        OutlinedTextField(
            value = newUsername,
            onValueChange = { newUsername = it },
            label = { Text("New Username") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )

        // Button to update username
        Button(
            onClick = { viewModel.updateUsername(user?.uid ?: "", newUsername) },
            modifier = Modifier.padding(top = 8.dp)
        ) {
            Text("Update Username")
        }

        Spacer(modifier = Modifier.height(16.dp))
        Divider()

        // Field to add a friend's username
        var friendUsername by remember { mutableStateOf("") }
        TextField(
            value = friendUsername,
            onValueChange = { friendUsername = it },
            label = { Text("Friend's Username") }
        )
        Button(onClick = { viewModel.addFriend(user?.uid ?: "", friendUsername) }) {
            Text("Add Friend")
        }

        Divider()

        // Friends list
        FriendsList(friendsList, navController)
        Text("Liked Songs", style = MaterialTheme.typography.h6)
        LazyColumn {
            items(likedSongs) { song ->
                SongListItem(song) {
                    // Handle song item click
                }
            }
        }

        Button(
            onClick = { navController.navigate("likedSongs") },
            modifier = Modifier.padding(top = 8.dp)
        ) {
            Text("View Liked Songs")
        }

    }

}


//~~~~~~~~~~
//~~~~~FRIENDS LIST/PROFILE~~~~~


class ProfileViewModel : ViewModel() {
    private val _friendsList = MutableLiveData<List<FriendData>>()
    val friendsList: LiveData<List<FriendData>> = _friendsList
    private val _username = MutableLiveData<String>()
    val username: LiveData<String> = _username
    private val _likedSongs = MutableLiveData<List<Song>>()
    val likedSongs: LiveData<List<Song>> = _likedSongs

    init {
        val currentUser = Firebase.auth.currentUser
        currentUser?.uid?.let {
            fetchUsername(it)
            fetchLikedSongs(it)
            fetchFriendsList(it)
        }
    }

    fun fetchUsername(userId: String) {
        val usersCollection = Firebase.firestore.collection("Users")
        usersCollection.document(userId).get().addOnSuccessListener { documentSnapshot ->
            _username.value = documentSnapshot["username"] as? String ?: "Unknown"
        }
    }

    fun addFriend(userId: String, friendUsername: String) {
        val usersCollection = Firebase.firestore.collection("Users")
        usersCollection.whereEqualTo("username", friendUsername).get()
            .addOnSuccessListener { documents ->
                if (!documents.isEmpty) {
                    val friendId = documents.documents.first().id
                    usersCollection.document(userId)
                        .update("friend_list", FieldValue.arrayUnion(friendId))
                        .addOnSuccessListener {
                            fetchFriendsList(userId) // Refresh the friends list
                        }
                }
            }
    }

    private fun fetchFriendsList(userId: String) {
        val usersCollection = Firebase.firestore.collection("Users")
        usersCollection.document(userId).get().addOnSuccessListener { document ->
            val friendIds = document["friend_list"] as? List<*> ?: return@addOnSuccessListener

            // Initialize an empty list to hold the friend data
            val friends = mutableListOf<FriendData>()

            // Fetch each friend's details
            for (id in friendIds) {
                usersCollection.document(id.toString()).get().addOnSuccessListener { friendDoc ->
                    val name = friendDoc["username"] as? String ?: "Unknown"
                    val profilePicUrl = friendDoc["profile_pic_url"] as? String ?: "https://via.placeholder.com/150"

                    // Add the friend data to the list
                    friends.add(FriendData(id, name, profilePicUrl))

                    // Update the LiveData once all friends are fetched
                    if (friends.size == friendIds.size) {
                        _friendsList.value = friends
                    }
                }
            }
        }
    }
    fun updateUsername(userId: String, newUsername: String) {
        val usersCollection = Firebase.firestore.collection("Users")
        val userDocument = usersCollection.document(userId)

        userDocument.get().addOnSuccessListener { documentSnapshot ->
            if (documentSnapshot.exists()) {
                // User exists, update the username
                userDocument.update("username", newUsername)
                    .addOnSuccessListener {
                        // Handle success
                    }
                    .addOnFailureListener {
                        // Handle failure
                    }
            } else {
                // User does not exist, create a new user with the username
                userDocument.set(mapOf("username" to newUsername, "liked_songs" to listOf<String>()))
                    .addOnSuccessListener {
                        // Handle success
                    }
                    .addOnFailureListener {
                        // Handle failure
                    }
            }
        }
    }
    fun fetchLikedSongs(userId: String) {
        val likedSongsCollection = Firebase.firestore
            .collection("Users")
            .document(userId)
            .collection("liked_songs")

        likedSongsCollection.get().addOnSuccessListener { documents ->
            val songIds = documents.documents.map { it.id }
            fetchSongsDetails(songIds)
        }
    }

    private fun fetchSongsDetails(songIds: List<String>) {
        if (songIds.isEmpty()) {
            _likedSongs.value = emptyList()
            return
        }

        val songsCollection = Firebase.firestore.collection("Tracks")
        songsCollection.whereIn(FieldPath.documentId(), songIds).get()
            .addOnSuccessListener { documents ->
                val songsList = documents.map { documentSnapshot ->
                    documentSnapshot.toObject(Song::class.java).apply {
                        // Set the id field to the document ID
                        id = documentSnapshot.id
                    }
                }
                _likedSongs.value = songsList
            }
    }
}

@Composable
fun LikedSongsScreen(navController: NavController) {
    val viewModel: ProfileViewModel = viewModel()
    val likedSongs by viewModel.likedSongs.observeAsState(initial = emptyList())
    val user = Firebase.auth.currentUser

    LaunchedEffect(key1 = user?.uid) {
        viewModel.fetchLikedSongs(user?.uid ?: "")
    }

    LazyColumn {
        items(likedSongs) { song ->
            SongListItem(song) {
                Log.d("SongDetailViewer", "Attempting to view song: ${song.id}")
                navController.navigate("songDetail/${song.id}")
            }
        }
    }
}



//~~~~~~~~~
//FRIENDS


class FriendProfileViewModel : ViewModel() {
    private val _username = MutableLiveData<String>()
    val username: LiveData<String> = _username
    private val _likedSongs = MutableLiveData<List<Song>>()
    val likedSongs: LiveData<List<Song>> = _likedSongs
    private val _friendsList = MutableLiveData<List<FriendData>>()
    val friendsList: LiveData<List<FriendData>> = _friendsList

    fun fetchFriendData(friendId: String) {
        fetchUsername(friendId)
        fetchLikedSongs(friendId)
        fetchFriendsList(friendId)
    }
    private fun fetchFriendsList(userId: String) {
        val usersCollection = Firebase.firestore.collection("Users")
        usersCollection.document(userId).get().addOnSuccessListener { document ->
            val friendIds = document["friend_list"] as? List<*> ?: return@addOnSuccessListener


            val friends = mutableListOf<FriendData>()


            for (id in friendIds) {
                usersCollection.document(id.toString()).get().addOnSuccessListener { friendDoc ->
                    val name = friendDoc["username"] as? String ?: "Unknown"
                    val profilePicUrl = friendDoc["profile_pic_url"] as? String ?: "https://via.placeholder.com/150"


                    friends.add(FriendData(id, name, profilePicUrl))


                    if (friends.size == friendIds.size) {
                        _friendsList.value = friends
                    }
                }
            }
        }
    }

    private fun fetchUsername(userId: String) {
        val usersCollection = Firebase.firestore.collection("Users")
        usersCollection.document(userId).get().addOnSuccessListener { documentSnapshot ->
            _username.value = documentSnapshot["username"] as? String ?: "Unknown"
        }
    }

    private fun fetchLikedSongs(userId: String) {
        val likedSongsCollection = Firebase.firestore
            .collection("Users")
            .document(userId)
            .collection("liked_songs")

        likedSongsCollection.get().addOnSuccessListener { documents ->
            val songIds = documents.documents.map { it.id }
            fetchSongsDetails(songIds)
        }
    }
    private fun fetchSongsDetails(songIds: List<String>) {
        if (songIds.isEmpty()) {
            _likedSongs.value = emptyList()
            return
        }

        val songsCollection = Firebase.firestore.collection("Tracks")
        songsCollection.whereIn(FieldPath.documentId(), songIds).get()
            .addOnSuccessListener { documents ->
                val songsList = documents.map { documentSnapshot ->
                    documentSnapshot.toObject(Song::class.java).apply {
                        // Set the id field to the document ID
                        id = documentSnapshot.id
                    }
                }
                _likedSongs.value = songsList
            }
    }

}

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
            .clickable { navController.navigate("profile/${friend.id}") }
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Friend profile picture
        Image(
            painter = painterResource(id = R.drawable.profile_placeholder),
            contentDescription = "Friend Profile Picture",
            modifier = Modifier.size(48.dp).clip(CircleShape)
        )
        Spacer(modifier = Modifier.width(16.dp))
        // Friend name
        Text(text = friend.name, style = MaterialTheme.typography.subtitle1)
    }
}

@Composable
fun FriendProfileScreen(friendId: String, navController: NavController) {
    val viewModel: FriendProfileViewModel = viewModel()
    val username by viewModel.username.observeAsState("Unknown")
    val likedSongs by viewModel.likedSongs.observeAsState(initial = emptyList())
    val friendsList by viewModel.friendsList.observeAsState(initial = emptyList())

    LaunchedEffect(key1 = friendId) {
        viewModel.fetchFriendData(friendId)
    }

    Column(modifier = Modifier.padding(16.dp).fillMaxSize()) {
        Text("Username: $username", style = MaterialTheme.typography.h6)
        Text("Liked Songs", style = MaterialTheme.typography.h6)
        LazyColumn {
            items(likedSongs) { song ->
                SongListItem(song) {
                    navController.navigate("songDetail/${song.id}")
                }
            }
        }
        Text("Friends", style = MaterialTheme.typography.h6)
        LazyColumn {
            items(friendsList) { friend ->
                FriendItem(friend, navController)
            }
        }
    }

}



//~~~~~~~~~~
//~~~~~~~~~~SONGS~~~~~~~~~~
//Song, SongViewModel, SongListScreen, SongListItem, SongDetailScreen

data class Song(
    var id: String = "",

    @get:PropertyName("track_name") @set:PropertyName("track_name") var trackName: String? = "",
    @get:PropertyName("artists") @set:PropertyName("artists") var artists: List<String>? = listOf(),
    @get:PropertyName("album_name") @set:PropertyName("album_name") var albumName: String? = "",
    @get:PropertyName("album_release_date") @set:PropertyName("album_release_date") var albumReleaseDate: String? = "",
    @get:PropertyName("album_type") @set:PropertyName("album_type") var albumType: String? = "",
    @get:PropertyName("album_URL") @set:PropertyName("album_URL") var albumUrl: String? = "",
    @get:PropertyName("album_images") @set:PropertyName("album_images") var albumImages: List<Map<String, Any>>? = listOf(),
    @get:PropertyName("artist_images") @set:PropertyName("artist_images") var artistImages: List<Map<String, Any>>? = listOf(),
    @get:PropertyName("artist_urls") @set:PropertyName("artist_urls") var artistUrls: List<String>? = listOf(),
    @get:PropertyName("danceability") @set:PropertyName("danceability") var danceability: Double? = 0.0,
    @get:PropertyName("energy") @set:PropertyName("energy") var energy: Double? = 0.0,
    @get:PropertyName("instrumentalness") @set:PropertyName("instrumentalness") var instrumentalness: Double? = 0.0,
    @get:PropertyName("key") @set:PropertyName("key") var key: Int? = 0,
    @get:PropertyName("length_in_seconds") @set:PropertyName("length_in_seconds") var lengthInSeconds: Double? = 0.0,
    @get:PropertyName("liveness") @set:PropertyName("liveness") var liveness: Double? = 0.0,
    @get:PropertyName("loudness") @set:PropertyName("loudness") var loudness: Double? = 0.0,
    @get:PropertyName("mode") @set:PropertyName("mode") var mode: Int? = 0,
    @get:PropertyName("rating") @set:PropertyName("rating") var rating: Int? = 0,
    @get:PropertyName("spotify_album_id") @set:PropertyName("spotify_album_id") var spotifyAlbumId: String? = "",
    @get:PropertyName("spotify_artist_id(s)") @set:PropertyName("spotify_artist_id(s)") var spotifyArtistIds: List<String>? = listOf(),
    @get:PropertyName("spotify_track_id") @set:PropertyName("spotify_track_id") var spotifyTrackId: String? = "",
    @get:PropertyName("tempo") @set:PropertyName("tempo") var tempo: Double? = 0.0,
    @get:PropertyName("track_url") @set:PropertyName("track_url") var trackUrl: String? = "",
    @get:PropertyName("valence") @set:PropertyName("valence") var valence: Double? = 0.0,
    @get:PropertyName("added_at") @set:PropertyName("added_at") var addedAt: Timestamp? = null
)



class SongsViewModel : ViewModel() {
    private val _songs = MutableLiveData<List<Song>>()
    val songs: LiveData<List<Song>> = _songs

    private val _addSongStatus = MutableLiveData<String>()
    val addSongStatus: LiveData<String> = _addSongStatus

    init {
        loadSongs()
    }

    private fun loadSongs() {
        val db = FirebaseFirestore.getInstance()

        db.collection("Tracks")
            .get()
            .addOnSuccessListener { documents ->
                val songsList = documents.mapNotNull { documentSnapshot ->
                    documentSnapshot.toObject(Song::class.java).apply {
                        id = documentSnapshot.id
                    }
                }
                Log.d("SongsViewModel", "Songs loaded: ${songsList.size}")
                _songs.value = songsList
            }
            .addOnFailureListener { exception ->
                Log.e("SongsViewModel", "Error loading songs", exception)
            }
    }

    fun addSong(song: Song) {
        val db = FirebaseFirestore.getInstance()
        db.collection("Tracks")
            .add(song)
            .addOnSuccessListener { documentReference ->
                _addSongStatus.value = "Song added successfully with ID: ${documentReference.id}"
            }
            .addOnFailureListener { e ->
                _addSongStatus.value = "Error adding song: ${e.message}"
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
        Text("Artists: ${song.artists?.joinToString(", ") ?: "Unknown Artist"}", style = MaterialTheme.typography.subtitle1)
        Text("Album: ${song.albumName ?: "Unknown Album"}", style = MaterialTheme.typography.body2)
        Text("Release Date: ${song.albumReleaseDate ?: "Unknown"}", style = MaterialTheme.typography.body2)
        // Add more fields as desired...
    }
    Divider()
}





private fun addLikedSongToFirestore(userId: String, songId: String) {
    val userLikedSongsCollection = Firebase.firestore
        .collection("Users")
        .document(userId)
        .collection("liked_songs")

    userLikedSongsCollection.document(songId)
        .set(mapOf("timestamp" to FieldValue.serverTimestamp()))
}

private fun removeLikedSongFromFirestore(userId: String, songId: String) {
    val userLikedSongsCollection = Firebase.firestore
        .collection("Users")
        .document(userId)
        .collection("liked_songs")

    userLikedSongsCollection.document(songId)
        .delete()
}



@Composable
fun SongDetailScreen(songId: String, viewModel: SongsViewModel = viewModel()) {
    val songs by viewModel.songs.observeAsState(initial = emptyList())
    val song = songs.firstOrNull { it.id == songId }
    val user = Firebase.auth.currentUser
    val userId = user?.uid

    // State to track whether the song is liked or not
    val isLiked = remember { mutableStateOf(false) }

    LaunchedEffect(userId) {
        if (userId != null) {
            val likedSongsCollection = Firebase.firestore
                .collection("Users")
                .document(userId)
                .collection("liked_songs")

            val likedSongDocument = likedSongsCollection.document(songId).get().await()
            isLiked.value = likedSongDocument.exists()
        }
    }


    song?.let { songDetail ->
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Track Name: ${songDetail.trackName ?: "Unknown"}", style = MaterialTheme.typography.h5)
            Text("Artist(s): ${songDetail.artists?.joinToString(", ") ?: "Unknown Artist"}", style = MaterialTheme.typography.subtitle1)
            Text("Album Name: ${songDetail.albumName ?: "Unknown"}", style = MaterialTheme.typography.subtitle1)
        }
        fun Double?.format(digits: Int) = this?.let { "%.${digits}f".format(this) }

        fun formatPercentage(value: Double?) = value?.let { "${(it * 100).format(1)}%" } ?: "Unknown"

        fun formatLength(lengthInSeconds: Double?) = lengthInSeconds?.let { "${it.toInt()} sec" } ?: "Unknown"

        fun formatMode(mode: Int?) = when(mode) {
            0 -> "Minor"
            1 -> "Major"
            else -> "Unknown"
        }

        fun formatTimestamp(timestamp: Timestamp?) = timestamp?.toDate()?.toString() ?: "Unknown"

        Column(modifier = Modifier.padding(16.dp)) {
            Text("Track Name: ${songDetail.trackName ?: "Unknown"}", style = MaterialTheme.typography.h5)
            Text("Artist(s): ${songDetail.artists?.joinToString(", ") ?: "Unknown Artist"}", style = MaterialTheme.typography.subtitle1)
            Text("Album Name: ${songDetail.albumName ?: "Unknown"}", style = MaterialTheme.typography.subtitle1)
            Text("Album Type: ${songDetail.albumType ?: "Unknown"}", style = MaterialTheme.typography.body1)
            Text("Release Date: ${songDetail.albumReleaseDate ?: "Unknown"}", style = MaterialTheme.typography.body1)
            Text("Danceability: ${formatPercentage(songDetail.danceability)}", style = MaterialTheme.typography.body1)
            Text("Energy: ${formatPercentage(songDetail.energy)}", style = MaterialTheme.typography.body1)
            Text("Instrumentalness: ${formatPercentage(songDetail.instrumentalness)}", style = MaterialTheme.typography.body1)
            Text("Key: ${songDetail.key ?: "Unknown"}", style = MaterialTheme.typography.body1)
            Text("Length: ${formatLength(songDetail.lengthInSeconds)}", style = MaterialTheme.typography.body1)
            Text("Liveness: ${formatPercentage(songDetail.liveness)}", style = MaterialTheme.typography.body1)
            Text("Loudness: ${songDetail.loudness ?: "Unknown"} dB", style = MaterialTheme.typography.body1)
            Text("Mode: ${formatMode(songDetail.mode)}", style = MaterialTheme.typography.body1)
            Text("Tempo: ${songDetail.tempo?.format(2) ?: "Unknown"} BPM", style = MaterialTheme.typography.body1)
            Text("Valence: ${formatPercentage(songDetail.valence)}", style = MaterialTheme.typography.body1)
            Text("Added At: ${formatTimestamp(songDetail.addedAt)}", style = MaterialTheme.typography.body1)

        }

    }



        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.Top
        ) {
            song.let {

                Spacer(modifier = Modifier.weight(1f))

                Button(
                    onClick = {
                        userId?.let { uid ->
                            isLiked.value = !isLiked.value
                            if (isLiked.value) {
                                addLikedSongToFirestore(uid, songId)
                            } else {
                                removeLikedSongFromFirestore(uid, songId)
                            }
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 16.dp)
                ) {
                    Text(if (isLiked.value) "Unlike" else "Like")
                }
            }
        }
    }