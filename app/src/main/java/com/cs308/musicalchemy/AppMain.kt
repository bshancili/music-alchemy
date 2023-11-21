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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment.Companion.Center
import androidx.compose.ui.Alignment.Companion.CenterHorizontally
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.annotation.ExperimentalCoilApi
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
import com.google.firebase.firestore.SetOptions
import coil.compose.rememberImagePainter


import com.google.firebase.firestore.firestore
import kotlinx.coroutines.tasks.await


//~~~~~~~~~~
// Placeholder data classes




//~~~~~~~~~~
//~~~~~THEME~~~~~
//Design colors, App theme and Logo
val PastelLavender = Color(0xFFCEB2FC)

private val appThemeColors = lightColors(
    primary = PastelLavender,
    primaryVariant = PastelLavender,
    secondary = PastelLavender,

    background = Color(0xFF1D2123),
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
            AuthStateManager.isAuthenticated.value = firebaseAuth.currentUser != null
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
        Log.d(TAG, "handleSignInResult called")
        try {
            val account = completedTask.getResult(ApiException::class.java)
            firebaseAuthWithGoogle(account.idToken!!)
        } catch (e: ApiException) {
            Log.w(TAG, "signInResult:failed code=" + e.statusCode)
        }
    }

    private fun firebaseAuthWithGoogle(idToken: String) {
        val credential = GoogleAuthProvider.getCredential(idToken, null)
        Log.d(TAG, "firebaseAuthWithGoogle called")
        auth.signInWithCredential(credential)
            .addOnCompleteListener(this) { task ->
                if (task.isSuccessful) {
                    Log.d(TAG, "signInWithCredential:success")
                    AuthStateManager.isAuthenticated.value = true
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
                popUpTo(navController.graph.startDestinationId) {
                    saveState = true
                }
                launchSingleTop = true
                restoreState = true
            }
        }
    }

    MainActivity()
    NavHost(navController, startDestination = "initialMenu") {

        composable("initialMenu") { InitialMenu(navController, startGoogleSignIn) }
        composable("login") { LoginScreen(navController) }
        composable("mainMenu") {
            val viewModel = viewModel<SongsViewModel>() // Instantiate your SongsViewModel here
            MainMenu(navController, viewModel)
        }
        composable("screen1") { Screen1(navController) }
        composable("screen2") { Screen2(navController) }
        composable("search") { Search(navController) }
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
            SongDetailScreen(navController, songId = backStackEntry.arguments?.getString("songId") ?: "")
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
fun TopNav(navController: NavController) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(64.dp)
            .background(color = Color(0xFF1D2123)),
            //.padding(bottom = 16.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Image(
            painter = painterResource(id = R.drawable.group11),
            contentDescription = "image description",
            contentScale = ContentScale.Crop, // Adjust the content scale as needed
            modifier = Modifier
                .fillMaxHeight() // Make the image fill the height of the row
                .aspectRatio(1f) // Maintain aspect ratio
                .clickable { navController.navigate("addSong") }
        )

        Box(
            modifier = Modifier
                .weight(1f) // Takes remaining space in the row
                .padding(horizontal = 16.dp) // Padding from sides and top/bottom
                .background(color = Color(0x5E33373B), shape = RoundedCornerShape(size = 15.dp))
                .fillMaxWidth() // Fill the entire width of the row
        ) {
            Text(
                text = "Music\nAlchemy",
                style = TextStyle(
                    fontSize = 22.sp,
                    lineHeight = 22.sp,
                    fontWeight = FontWeight(400),
                    color = Color(0xFFFFFFFF),
                    textAlign = TextAlign.Center
                ),
                modifier = Modifier
                    .fillMaxSize() // Fill the entire Text composable
                    .padding(vertical = 8.dp), // Padding from the sides of the text
                 // Center the text within the Text composable
            )
        }

        Image(
            painter = painterResource(id = R.drawable.group10),
            contentDescription = "image description",
            contentScale = ContentScale.Crop, // Adjust the content scale as needed
            modifier = Modifier
                .fillMaxHeight() // Make the image fill the height of the row
                .aspectRatio(1f) // Maintain aspect ratio
                .clickable { navController.navigate("profile") }
        )
    }
}

@Composable
fun CommonBottomBar(navController: NavController) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(64.dp)
            .background(color = Color(0xFF1D2123)),
        //.padding(bottom = 16.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Image(
            painter = painterResource(id = R.drawable.home),
            contentDescription = "image description",
            contentScale = ContentScale.Crop, // Adjust the content scale as needed
            modifier = Modifier
                .fillMaxHeight() // Make the image fill the height of the row
                .aspectRatio(1f) // Maintain aspect ratio
                .clickable { navController.navigate("mainMenu") }
        )

        Image(
            painter = painterResource(id = R.drawable.search),
            contentDescription = "image description",
            contentScale = ContentScale.Crop, // Adjust the content scale as needed
            modifier = Modifier
                .fillMaxHeight() // Make the image fill the height of the row
                .aspectRatio(1f) // Maintain aspect ratio
                .clickable { navController.navigate("search") }
        )

        Image(
            painter = painterResource(id = R.drawable.recommendation),
            contentDescription = "image description",
            contentScale = ContentScale.Crop, // Adjust the content scale as needed
            modifier = Modifier
                .fillMaxHeight() // Make the image fill the height of the row
                .aspectRatio(1f) // Maintain aspect ratio
                .clickable { /* Handle click if needed */ }
        )

        Image(
            painter = painterResource(id = R.drawable.dm),
            contentDescription = "image description",
            contentScale = ContentScale.Crop, // Adjust the content scale as needed
            modifier = Modifier
                .fillMaxHeight() // Make the image fill the height of the row
                .aspectRatio(1f) // Maintain aspect ratio
                .clickable { /* Handle click if needed */ }
        )
    }
}
//~~~~~~~~~~
////~~~~~MAIN MENU~~~~~

@Composable
fun MainMenu(navController: NavController, viewModel: SongsViewModel) {
    val songs by viewModel.songs.observeAsState(emptyList())

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(color = Color(0xFF1D2123))
            .padding(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 15.dp),
    ) {
        TopNav(navController = navController)

        Spacer(modifier = Modifier.height(16.dp))

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(192.dp)
                .background(color = Color(0x5E33373B), shape = RoundedCornerShape(size = 20.dp))
        ) {
            // Add content inside the Box as needed
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Top charts",
            style = TextStyle(
                fontSize = 20.sp,
                lineHeight = 24.sp,
                fontWeight = FontWeight(700),
                color = Color(0xFFEFEEE0),
            ),
            modifier = Modifier
                .fillMaxWidth()
                .height(24.dp)
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Keep the first LazyRow unchanged
        LazyRow(
            modifier = Modifier
                .fillMaxWidth()
                .height(128.dp)
                .background(color = Color(0xFF1A1E1F), shape = RoundedCornerShape(size = 20.dp))
        ) {
            items(songs) { song ->
                SongItem(song = song)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Music",
            style = TextStyle(
                fontSize = 20.sp,
                lineHeight = 24.sp,
                fontWeight = FontWeight(700),
                color = Color(0xFFEFEEE0),
            ),
            modifier = Modifier
                .fillMaxWidth()
                .height(24.dp)
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Use LazyColumn with itemsInRow for the two-column layout
        LazyColumn(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f) // Takes up the available space
                .background(color = Color(0xFF1A1E1F), shape = RoundedCornerShape(size = 20.dp)),
        ) {
            items(songs.windowed(2, step = 2, partialWindows = true)) { rowSongs ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(290.dp)
                        .padding(bottom = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    for (song in rowSongs) {
                        SongItemMusic(song = song, navController = navController)
                    }
                }
            }
        }

        CommonBottomBar(navController = navController)
    }
}

@OptIn(ExperimentalCoilApi::class)
@Composable
fun SongItemMusic(song: Song, navController: NavController) {
    Card(
        modifier = Modifier
            .height(290.dp) // Adjust the height as needed
            .width(185.dp),
        shape = RoundedCornerShape(20.dp),
        backgroundColor = Color(0xFF1A1E1F)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(8.dp)
        ) {
            // Album Image
            val imageUrl: String? = song.albumImages?.firstOrNull()?.get("url") as? String
            imageUrl?.let {
                Image(
                    painter = rememberImagePainter(data = it),
                    contentDescription = null,
                    modifier = Modifier
                        .size(185.dp)
                        .clip(shape = RoundedCornerShape(20.dp))
                        .clickable { navController.navigate("songDetail/${song.id}") },
                    contentScale = ContentScale.FillBounds
                )
            }
            // Spacer to add some space between the image and text
            Spacer(modifier = Modifier.height(8.dp))

            // Text for track name
            Text(
                text = "${song.trackName}",
                color = Color.White,
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp
            )

            // Text for artist
            Text(
                text = "${song.artists}",
                color = Color.White,
                fontSize = 12.sp
            )
        }
    }
}


@OptIn(ExperimentalCoilApi::class)
@Composable
fun SongItem(song: Song) {
    Card(
        modifier = Modifier
            .width(380.dp)
            .height(128.dp),
        shape = RoundedCornerShape(20.dp),
        backgroundColor = Color(0xFF1A1E1F)
    ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(), // Add padding to the Box
                contentAlignment = Alignment.CenterStart
            ) {
                // Image with proper alignment
                val imageUrl: String? = song.albumImages?.firstOrNull()?.get("url") as? String
                imageUrl?.let {
                    Image(
                        painter = rememberImagePainter(data = it),
                        contentDescription = null,
                        modifier = Modifier
                            .size(128.dp)
                            .clip(shape = RoundedCornerShape(20.dp)),
                        contentScale = ContentScale.FillBounds
                    )
                }
                // Column for text
                Column(
                    modifier = Modifier
                        .padding(start = 8.dp) // Adjust the padding as needed
                        .align(Alignment.TopStart), // Align the Column to the top
                    verticalArrangement = Arrangement.Top
                ) {
                    // Text for track name
                    Text(
                        modifier = Modifier
                            .padding(start = 128.dp),
                        text = "${song.trackName}",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 17.sp
                    )

                    // Text for artist
                    Text(
                        modifier = Modifier
                            .padding(start = 128.dp),
                        text = "${song.artists}",
                        color = Color(0x80FFFFFF),
                        fontSize = 12.sp
                    )
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
fun Search(navController: NavController) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(color = Color(0xFF1D2123))
            .padding(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 15.dp)
    ) {
        TopNav(navController = navController)

        Spacer(modifier = Modifier.height(16.dp))

        // Search Input Field
        var searchText by remember { mutableStateOf("") }
        TextField(
            value = searchText,
            onValueChange = { searchText = it },
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text("Search...") },
            colors = TextFieldDefaults.textFieldColors(
                backgroundColor = Color.Transparent,
                textColor = Color.White
            )
        )

        // You can add more search-related components here

        // Fill the remaining space before the bottom bar
        Spacer(modifier = Modifier.weight(1f))

        CommonBottomBar(navController = navController)
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
                AuthStateManager.isAuthenticated.value = false // Set isAuthenticated to false
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

    Column(modifier = Modifier
        .padding(16.dp)
        .fillMaxSize()) {
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
            modifier = Modifier
                .size(48.dp)
                .clip(CircleShape)
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

    Column(modifier = Modifier
        .padding(16.dp)
        .fillMaxSize()) {
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
    @get:PropertyName("rating") @set:PropertyName("rating") var rating: Double? = 0.0,
    @get:PropertyName("spotify_album_id") @set:PropertyName("spotify_album_id") var spotifyAlbumId: String? = "",
    @get:PropertyName("spotify_artist_id(s)") @set:PropertyName("spotify_artist_id(s)") var spotifyArtistIds: List<String>? = listOf(),
    @get:PropertyName("spotify_track_id") @set:PropertyName("spotify_track_id") var spotifyTrackId: String? = "",
    @get:PropertyName("tempo") @set:PropertyName("tempo") var tempo: Double? = 0.0,
    @get:PropertyName("track_url") @set:PropertyName("track_url") var trackUrl: String? = "",
    @get:PropertyName("valence") @set:PropertyName("valence") var valence: Double? = 0.0,
    @get:PropertyName("added_at") @set:PropertyName("added_at") var addedAt: Timestamp? = null,
    @get:PropertyName("like_count") @set:PropertyName("like_count") var likeCount: Int? = 0,
)

class SongsViewModel : ViewModel() {
    private val _songs = MutableLiveData<List<Song>>()
    val songs: LiveData<List<Song>> = _songs

    private val _addSongStatus = MutableLiveData<String>()
    val addSongStatus: LiveData<String> = _addSongStatus

    init {
        loadSongs()
    }

    //FIRESTORE'DA BAZI RATINGLER STRING HALINDE O YÜZDEN ONLARI INTEGERA DONÜŞTÜRMEK GEREKİYOR
    private fun loadSongs() {
        val db = FirebaseFirestore.getInstance()

        db.collection("Tracks")
            .get()
            .addOnSuccessListener { documents ->
                val songsList = documents.mapNotNull { documentSnapshot ->
                    try {
                        val song = documentSnapshot.toObject(Song::class.java)
                        song?.let {
                            // Ensure "rating" is an integer
                            it.rating = try {
                                it.rating?.toString()?.toDoubleOrNull() ?: 0.0
                            } catch (e: NumberFormatException) {
                                // Log an error if the conversion fails
                                Log.e("SongsViewModel", "Error converting rating to double for song ${it.id}", e)
                                0.0 // Default to 0.0 in case of an error
                            }
                            it.id = documentSnapshot.id
                            return@let it // Explicitly return the modified Song object
                        }
                    } catch (e: Exception) {
                        Log.e("SongsViewModel", "Error deserializing song", e)
                        null
                    }
                }

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
    val userDocument = Firebase.firestore
        .collection("Users")
        .document(userId)

    // Use a transaction to increment the like_count field
    Firebase.firestore.runTransaction { transaction ->
        val songDocument = Firebase.firestore
            .collection("Tracks")
            .document(songId)

        // Get the current like_count value
        val currentLikes = transaction.get(songDocument).get("like_count") as? Long ?: 0

        // Increment the like_count by 1
        val newLikes = currentLikes + 1

        // Update the like_count field
        transaction.update(songDocument, "like_count", newLikes)

        // Update the liked_song_list field in the user's document
        val likedSongs = mapOf(
            songId to mapOf(
                "timestamp" to FieldValue.serverTimestamp()
            )
        )

        transaction.set(userDocument, mapOf("liked_song_list" to likedSongs), SetOptions.merge())

        // Return the new like_count value
        newLikes
    }
}


private fun removeLikedSongFromFirestore(userId: String, songId: String) {
    val userDocument = Firebase.firestore
        .collection("Users")
        .document(userId)

    // Use a transaction to decrement the like_count field
    Firebase.firestore.runTransaction { transaction ->
        val songDocument = Firebase.firestore
            .collection("Tracks")
            .document(songId)

        // Get the current like_count value
        val currentLikes = transaction.get(songDocument).get("like_count") as? Long ?: 0

        // Ensure the like_count doesn't go below 0
        val newLikes = if (currentLikes > 0) currentLikes - 1 else 0

        // Update the like_count field
        transaction.update(songDocument, "like_count", newLikes)

        // Remove the song from the liked_song_list field in the user's document
        transaction.update(userDocument, "liked_song_list.$songId", FieldValue.delete())

        // Return the new like_count value
        newLikes
    }
}

@Composable
fun SongDetailScreen(navController: NavController, songId: String, viewModel: SongsViewModel = viewModel()) {


    val songs by viewModel.songs.observeAsState(initial = emptyList())
    val song = songs.firstOrNull { it.id == songId }
    val user = Firebase.auth.currentUser
    val userId = user?.uid

    // State to track whether the song is liked or not
    val isLiked = remember { mutableStateOf(false) }

    val onLikeClick: () -> Unit = {
        val user = Firebase.auth.currentUser
        val userId = user?.uid

        if (userId != null) {
            if (isLiked.value) {
                // Remove the song from liked songs
                removeLikedSongFromFirestore(userId, songId)
            } else {
                // Add the song to liked songs
                addLikedSongToFirestore(userId, songId)
            }

            // Toggle the liked status
            isLiked.value = !isLiked.value
        }
    }

    LaunchedEffect(userId) {
        if (userId != null) {
            val userDocument = Firebase.firestore
                .collection("Users")
                .document(userId)

            val likedSongs = userDocument.get().await().get("liked_song_list") as? Map<*, *>
            isLiked.value = likedSongs?.containsKey(songId) ?: false
        }
    }
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(color = Color(0xFF1D2123))
            .padding(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 15.dp),
    ) {
        TopNav(navController = navController)

        Spacer(modifier = Modifier.height(16.dp))

        Column( modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .weight(1f) // Takes up all available vertical space
        ){
            val imageUrl: String? = song?.albumImages?.firstOrNull()?.get("url") as? String
            imageUrl?.let {
                Image(
                    painter = rememberImagePainter(data = it),
                    contentDescription = null,
                    modifier = Modifier
                        .fillMaxWidth()
                        .aspectRatio(1f)
                        .clip(shape = RoundedCornerShape(20.dp))
                        .align(CenterHorizontally),
                    contentScale = ContentScale.FillBounds
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            val albumName: String? = song?.albumName

            if (albumName != null) {
                Text(
                    text = albumName,
                    style = TextStyle(
                        fontSize = 24.sp,
                        lineHeight = 24.sp,
                        fontWeight = FontWeight(600),
                        color = Color(0x80FFFFFF),
                    ),
                    modifier = Modifier
                        .width(211.dp),
                )
            }

            val trackName: String? = song?.trackName

            if (trackName != null) {
                Text(
                    text = trackName,
                    style = TextStyle(
                        fontSize = 48.sp,
                        lineHeight = 48.sp,
                        fontWeight = FontWeight(700),
                        color = Color(0xFFFFFFFF)
                    ),
                    modifier = Modifier
                        .width(327.dp),
                )
            }

            val artists = song?.artists

            if (artists != null) {
                Column{
                    artists.forEach { artist ->
                        Text(
                            text = artist,
                            style = TextStyle(
                                fontSize = 24.sp,
                                lineHeight = 24.sp,
                                fontWeight = FontWeight(300),
                                color = Color(0xFFFFFFFF),
                            ),
                            modifier = Modifier
                                .padding(top = 4.dp)
                                .width(327.dp),
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                horizontalArrangement = Arrangement.spacedBy(16.dp, Alignment.Start),
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(64.dp)
            ) {
                Box(
                    modifier = Modifier
                        .width(106.22222.dp)
                        .height(64.dp)
                        .background(color = Color(0x5E33373B), shape = RoundedCornerShape(size = 15.dp))
                ) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(4.dp, Alignment.Start),
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .width(66.38889.dp)
                            .align(Center),
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.icon),
                            contentDescription = "icon",
                            contentScale = ContentScale.FillBounds,
                            modifier = Modifier
                                .padding(0.dp)
                                .size(24.dp),
                        )
                        val rating: Double? = song?.rating

                        if (rating != null) {
                            Text(
                                text = rating.toString(),
                                style = TextStyle(
                                    fontSize = 24.sp,
                                    lineHeight = 24.sp,
                                    fontWeight = FontWeight(600),
                                    color = Color(0xFFFFFFFF)
                                ),
                                modifier = Modifier
                                    .fillMaxWidth(),
                            )
                        }
                    }
                }

                Box(
                    modifier = Modifier
                        .width(106.22222.dp)
                        .height(64.dp)
                        .background(color = Color(0x5E33373B), shape = RoundedCornerShape(size = 15.dp))
                ) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(4.dp, Alignment.CenterHorizontally),
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .width(70.81482.dp)
                            .align(Center),
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.heart),
                            contentDescription = "heart",
                            contentScale = ContentScale.FillBounds,
                            modifier = Modifier
                                .padding(1.dp)
                                .size(24.dp),
                        )
                        val likeCount: Int? = song?.likeCount

                        if (likeCount != null) {
                            Text(
                                text = likeCount.toString(),
                                style = TextStyle(
                                    fontSize = 24.sp,
                                    lineHeight = 24.sp,
                                    fontWeight = FontWeight(600),
                                    color = Color(0xFFFFFFFF)
                                ),
                                modifier = Modifier
                                    .padding(bottom = 4.dp)
                                    .width(36.dp),
                            )
                        }
                    }
                }

            }

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                horizontalArrangement = Arrangement.spacedBy(16.dp, Alignment.CenterHorizontally),
                verticalAlignment = Alignment.Top,
            ) {
                Box(
                    modifier = Modifier
                        .width(152.dp)
                        .height(64.dp)
                        .background(color = Color(0xFF1DB954), shape = RoundedCornerShape(size = 15.dp))
                ){
                    Image(
                        painter = painterResource(id = R.drawable.spotify_logo),
                        contentDescription = "spotifylogo",
                        contentScale = ContentScale.FillBounds,
                        modifier = Modifier
                            .offset(x = 12.dp, y = 13.dp)
                            .width(128.dp)
                            .height(38.dp),
                    )
                }

                if(isLiked.value) {
                    Image(
                        painter = painterResource(id = R.drawable.likedbutton),
                        contentDescription = "likebutton",
                        contentScale = ContentScale.FillBounds,
                        modifier = Modifier
                            .clickable { onLikeClick() }
                            .padding(0.dp)
                            .width(64.dp)
                            .height(64.dp),
                    )
                }
                else{
                    Image(
                        painter = painterResource(id = R.drawable.likebutton),
                        contentDescription = "likebutton",
                        contentScale = ContentScale.FillBounds,
                        modifier = Modifier
                            .clickable { onLikeClick() }
                            .padding(0.dp)
                            .width(64.dp)
                            .height(64.dp),
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                horizontalArrangement = Arrangement.spacedBy(16.dp, Alignment.CenterHorizontally),
                verticalAlignment = Alignment.Top,
                modifier = Modifier
                    .fillMaxWidth()
            ){
                Image(
                    painter = painterResource(id = R.drawable.plus),
                    contentDescription = "plus",
                    contentScale = ContentScale.FillBounds,
                    modifier = Modifier
                        .padding(0.dp)
                        .width(64.dp)
                        .aspectRatio(1f)
                        .weight(1f)
                        .clickable{},
                )
                Image(
                    painter = painterResource(id = R.drawable.comment),
                    contentDescription = "comment",
                    contentScale = ContentScale.FillBounds,
                    modifier = Modifier
                        .padding(0.dp)
                        .width(64.dp)
                        .aspectRatio(1f)
                        .weight(1f)
                        .clickable{},
                )
                Image(
                    painter = painterResource(id = R.drawable.share),
                    contentDescription = "share",
                    contentScale = ContentScale.FillBounds,
                    modifier = Modifier
                        .padding(0.dp)
                        .width(64.dp)
                        .aspectRatio(1f)
                        .weight(1f)
                        .clickable{},
                )
                Image(
                    painter = painterResource(id = R.drawable.save),
                    contentDescription = "save",
                    contentScale = ContentScale.FillBounds,
                    modifier = Modifier
                        .padding(0.dp)
                        .width(64.dp)
                        .aspectRatio(1f)
                        .weight(1f)
                        .clickable{},
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Comments",
                style = TextStyle(
                    fontSize = 35.sp,
                    lineHeight = 42.sp,
                    fontWeight = FontWeight(700),
                    color = Color(0xFFFFFFFF),
                )
            )

            Spacer(modifier = Modifier.height(12.dp))
            //Place Holder Comment Boxes
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(128.dp)
                    .background(color = Color(0x5E33373B), shape = RoundedCornerShape(size = 15.dp))
            ){}

            Spacer(modifier = Modifier.height(16.dp))

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(128.dp)
                    .background(color = Color(0x5E33373B), shape = RoundedCornerShape(size = 15.dp))
            ){}
        }

        CommonBottomBar(navController = navController)

    }
}

