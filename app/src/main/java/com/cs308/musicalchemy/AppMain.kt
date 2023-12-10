//Package and imports
package com.cs308.musicalchemy


import android.app.Activity
import android.app.Application
import android.content.ContentValues.TAG
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.ActivityResult
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Alignment.Companion.Center
import androidx.compose.ui.Alignment.Companion.CenterHorizontally
import androidx.compose.ui.Alignment.Companion.CenterVertically
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import coil.annotation.ExperimentalCoilApi
import coil.compose.rememberImagePainter
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.tasks.Task
import com.google.firebase.Firebase
import com.google.firebase.FirebaseApp
import com.google.firebase.Timestamp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.auth.auth
import com.google.firebase.firestore.FieldPath
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.PropertyName
import com.google.firebase.firestore.SetOptions


import com.google.firebase.firestore.firestore
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import java.util.Locale

import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Query
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory


//~~~~~~~~~~
// Placeholder data classes




//~~~~~~~~~~
//~~~~~THEME~~~~~
//Design colors, App theme and Logo
val PastelLavender = Color(0xFF1D2123)

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

        initializeUserFields()


        super.onCreate()
    }
}
@Suppress("UNCHECKED_CAST")
private fun initializeUserFields() {
    val db = FirebaseFirestore.getInstance()
    val auth = FirebaseAuth.getInstance()
    val userId = auth.currentUser?.uid

    if (userId != null) {
        val userRef = db.collection("Users").document(userId)

        userRef.get().addOnCompleteListener { task ->
            if (task.isSuccessful) {
                val document = task.result
                if (document != null && document.exists()) {
                    // User document exists, check and complete unavailable fields
                    Log.d("MainApp", "User document already exists for UID: $userId")

                    val comments = document.get("comments") as? List<String> ?: emptyList()
                    val friendsList = document.get("friends_list") as? List<String> ?: emptyList()
                    val likedSongList = document.get("liked_song_list") as? Map<String, Any> ?: emptyMap()
                    val ratedSongList = document.get("rated_song_list") as? Map<String, Any> ?: emptyMap()
                    val profilePictureUrl = document.getString("profile_picture_url")
                    val uid = document.getString("uid")
                    val username = document.getString("username")

                    // Check and complete unavailable fields
                    if (comments.isEmpty()) {
                        userRef.update("comments", arrayListOf<String>())
                    }
                    if (friendsList.isEmpty()) {
                        userRef.update("friends_list", arrayListOf<String>())
                    }
                    if (likedSongList.isEmpty()) {
                        userRef.update("liked_song_list", hashMapOf<String, Any>())
                    }
                    if (ratedSongList.isEmpty()) {
                        userRef.update("rated_song_list", hashMapOf<String, Any>())
                    }
                    if (uid == null) {
                        userRef.update("uid", userId)
                    }
                    if (username == null) {
                        userRef.update("username", "default_username")
                    }
                    if (profilePictureUrl == null) {
                        userRef.update("profile_picture_url", "http://res.cloudinary.com/ddjyxzbjg/image/upload/v1699788333/pgreicq1gxpo5pbpgnib.png")
                    }
                } else {
                    // User document does not exist, initialize fields
                    Log.d("MainApp", "Initializing user document for UID: $userId")
                    val initialData = hashMapOf(
                        "comments" to arrayListOf<String>(),
                        "friends_list" to arrayListOf<String>(),
                        "liked_song_list" to hashMapOf<String, Any>(),
                        "rated_song_list" to hashMapOf<String, Any>(),
                        "uid" to userId,
                        "username" to "default_username",
                        "profile_picture_url" to "http://res.cloudinary.com/ddjyxzbjg/image/upload/v1699788333/pgreicq1gxpo5pbpgnib.png"
                    )

                    // Set the initial data in the Firestore document
                    userRef.set(initialData)
                        .addOnSuccessListener {
                            Log.d("MainApp", "User document initialized successfully for UID: $userId")
                        }
                        .addOnFailureListener { e ->
                            Log.e("MainApp", "Failed to initialize user document for UID: $userId", e)
                        }
                }
            } else {
                Log.e("MainApp", "Failed to get user document for UID: $userId", task.exception)
            }
        }
    } else {
        Log.w("MainApp", "User ID is null. Unable to initialize user fields.")
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
        composable("search") { Search(navController) }
        composable("searchUser") { SearchUser(navController)}
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
        composable("songDetail/{songId}", arguments = listOf(navArgument("songId") { type = NavType.StringType })) { backStackEntry ->
            SongDetailScreen(navController, songId = backStackEntry.arguments?.getString("songId") ?: "")
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
        horizontalAlignment = CenterHorizontally
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
        horizontalAlignment = CenterHorizontally,
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
        horizontalAlignment = CenterHorizontally
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
                .clickable { navController.navigate("settings") }
        )
    }
}
//~~~~~~~~~~
////~~~~~MAIN MENU~~~~~

@Composable
fun MainMenu(navController: NavController, viewModel: SongsViewModel) {
    val songs by viewModel.songs.observeAsState(emptyList())

    // Use verticalScroll modifier for vertical scrolling
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(color = Color(0xFF1D2123))
            .padding(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 15.dp), // Add verticalScroll to enable scrolling
    ) {

        TopNav(navController = navController)
        Spacer(modifier = Modifier.height(16.dp))

        Column( modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .weight(1f) // Takes up all available vertical space
        ){

            Spacer(modifier = Modifier.height(16.dp))
            /*
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(192.dp)
                    .background(color = Color(0x5E33373B), shape = RoundedCornerShape(size = 20.dp))
            ) {
                // Add content inside the Box as needed
            }

             */

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

            // Display images in a static way with 2 images per row
            for (i in songs.indices step 2) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    if (i < songs.size) {
                        DisplaySong(song = songs[i], navController = navController)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    if (i + 1 < songs.size) {
                        DisplaySong(song = songs[i + 1], navController = navController)
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
            }
        }
        CommonBottomBar(navController = navController)
    }
}

@OptIn(ExperimentalCoilApi::class)
@Composable
fun DisplaySong(song: Song, navController: NavController) {
    val imageUrl: String? = song.albumImages?.firstOrNull()?.get("url") as? String
    imageUrl?.let {
        Column(
            modifier = Modifier
                .width(185.dp)
                .clickable { navController.navigate("songDetail/${song.id}") }
                .padding(bottom = 24.dp)
        ) {
            // Image
            Image(
                painter = rememberImagePainter(data = it),
                contentDescription = null,
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1f)
                    .clip(shape = RoundedCornerShape(20.dp)),
                contentScale = ContentScale.FillBounds
            )
            Spacer(modifier = Modifier.height(8.dp))

            // Text for track name
            Text(
                text = "${song.trackName}",
                color = Color.White,
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.fillMaxWidth()
            )
            // Text for artist
            Text(
                text = "${song.artists}",
                color = Color.White,
                fontSize = 12.sp,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.fillMaxWidth()
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
fun Search(navController: NavController, viewModel: SongsViewModel = viewModel()) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(color = Color(0xFF1D2123))
            .padding(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 15.dp)
    ) {
        TopNav(navController = navController)

        Spacer(modifier = Modifier.height(16.dp))

        var searchText by remember { mutableStateOf("") }
        var displaySongs by remember { mutableStateOf(false) }
        val isLoading by viewModel.isLoading.observeAsState(initial = false)

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp)
        ) {


            TextField(
                value = searchText,
                onValueChange = { newText ->
                    searchText = newText
                    displaySongs = newText.isNotBlank()
                    if (displaySongs) {
                        viewModel.loadSongsWithSubstring(newText)
                    }
                },
                modifier = Modifier
                    .weight(1f)
                    .height(56.dp)
                    .background(color = Color(0xFFF5F5F5), shape = RoundedCornerShape(12.dp)),
                textStyle = TextStyle(color = Color.Black, fontSize = 18.sp),
                placeholder = { Text("Search Songs...", color = Color.Gray) },
                singleLine = true,
                colors = TextFieldDefaults.textFieldColors(
                    backgroundColor = Color.Transparent,
                    cursorColor = Color.Black,
                    focusedIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent
                )
            )

            Spacer(modifier = Modifier.width(8.dp))

            Button(
                onClick = { navController.navigate("searchUser") },
                modifier = Modifier
                    .width(90.dp) // Set the width to your desired value
                    .height(56.dp), // Match the height of the TextField
                colors = ButtonDefaults.buttonColors(backgroundColor = MaterialTheme.colors.primaryVariant),
                shape = RoundedCornerShape(12.dp) // Assuming the same roundness as the Logo
            ) {
                Text("Search User")
            }


        }

        if (displaySongs && !isLoading) {
            val songs by viewModel.songs.observeAsState(initial = emptyList())
            if (songs.isEmpty() && searchText.isNotBlank()) {
                Text(
                    "No result!",
                    color = Color.White,
                    modifier = Modifier
                        .align(CenterHorizontally)
                        .padding(top = 16.dp),

                    )
            } else if (songs.isNotEmpty()) {
                LazyColumn(modifier = Modifier.weight(1f)) {
                    items(songs.chunked(2)) { songPair ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            DisplaySong(song = songPair[0], navController = navController)
                            if (songPair.size > 1) {
                                Spacer(modifier = Modifier.width(8.dp))
                                DisplaySong(song = songPair[1], navController = navController)
                            }
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                    }
                }
            }
        }else if (isLoading) {
            Text(
                "Loading...",
                color = Color.White,
                modifier = Modifier
                    .align(CenterHorizontally)
                    .padding(top = 16.dp),

                )
            Spacer(modifier = Modifier.weight(1f))
        } else {
            Spacer(modifier = Modifier.weight(1f))
        }

        CommonBottomBar(navController = navController)
    }
}

@OptIn(ExperimentalCoilApi::class)
@Composable
fun DisplayUser(user: User, navController: NavController) {
    val imageUrl: String? = user.profilePictureUrl
    imageUrl?.let {
        Column(
            modifier = Modifier
                .width(185.dp)
                .clickable { navController.navigate("userDetail/${user.uid}") }
                .padding(bottom = 24.dp)
        ) {
            // Image
            Image(
                painter = rememberImagePainter(data = it),
                contentDescription = "User Profile Picture",
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1f)
                    .clip(shape = RoundedCornerShape(20.dp)),
                contentScale = ContentScale.Crop
            )
            Spacer(modifier = Modifier.height(8.dp))

            // Text for username
            Text(
                text = user.username ?: "",
                color = Color.White,
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

@OptIn(ExperimentalCoilApi::class)
@Composable
fun UserItem(user: User) {
    Card(
        modifier = Modifier
            .width(380.dp)
            .height(128.dp),
        shape = RoundedCornerShape(20.dp),
        backgroundColor = Color(0xFF1A1E1F)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth(),
            contentAlignment = Alignment.CenterStart
        ) {
            // Image with proper alignment
            val imageUrl: String? = user.profilePictureUrl
            imageUrl?.let {
                Image(
                    painter = rememberImagePainter(data = it),
                    contentDescription = "User Profile Picture",
                    modifier = Modifier
                        .size(128.dp)
                        .clip(shape = RoundedCornerShape(20.dp)),
                    contentScale = ContentScale.Crop
                )
            }
            // Column for text
            Column(
                modifier = Modifier
                    .padding(start = 8.dp)
                    .align(Alignment.TopStart),
                verticalArrangement = Arrangement.Top
            ) {
                // Text for username
                Text(
                    modifier = Modifier
                        .padding(start = 128.dp),
                    text = user.username ?: "",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 17.sp
                )
                // Optional: Additional text for user info, if needed
            }
        }
    }
}

@Composable
fun SearchUser(navController: NavController, viewModel: UsersViewModel = viewModel()) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(color = Color(0xFF1D2123))
            .padding(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 16.dp)
    ) {
        TopNav(navController = navController)

        Spacer(modifier = Modifier.height(16.dp))

        var searchText by remember { mutableStateOf("") }
        var displayUsers by remember { mutableStateOf(false) }
        val isLoading by viewModel.isLoading.observeAsState(initial = false)

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp)
        ) {
            TextField(
                value = searchText,
                onValueChange = { newText ->
                    searchText = newText
                    displayUsers = newText.isNotBlank()
                    if (displayUsers) {
                        viewModel.loadUsersWithSubstring(newText)
                    }
                },
                modifier = Modifier
                    .weight(1f)
                    .height(56.dp)
                    .background(color = Color(0xFFF5F5F5), shape = RoundedCornerShape(12.dp)),
                textStyle = TextStyle(color = Color.Black, fontSize = 18.sp),
                placeholder = { Text("Search Users...", color = Color.Gray) },
                singleLine = true,
                colors = TextFieldDefaults.textFieldColors(
                    backgroundColor = Color.Transparent,
                    cursorColor = Color.Black,
                    focusedIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent
                )
            )

            Spacer(modifier = Modifier.width(8.dp))

            Button(
                onClick = { navController.navigate("search") },
                modifier = Modifier
                    .width(90.dp) // Set the width to your desired value
                    .height(56.dp), // Match the height of the TextField
                colors = ButtonDefaults.buttonColors(backgroundColor = MaterialTheme.colors.primaryVariant),
                shape = RoundedCornerShape(12.dp) // Assuming the same roundness as the Logo
            ) {
                Text("Search Songs")
            }
        }

        if (displayUsers && !isLoading) {
            val users by viewModel.users.observeAsState(initial = emptyList())
            if (users.isEmpty() && searchText.isNotBlank()) {
                Text(
                    "No result!",
                    color = Color.White,
                    modifier = Modifier
                        .align(CenterHorizontally)
                        .padding(top = 16.dp)
                )
            } else if (users.isNotEmpty()) {
                LazyColumn(modifier = Modifier.weight(1f)) {
                    items(users.chunked(2)) { userPair ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            DisplayUser(user = userPair[0], navController = navController)
                            if (userPair.size > 1) {
                                Spacer(modifier = Modifier.width(8.dp))
                                DisplayUser(user = userPair[1], navController = navController)
                            }
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                    }
                }
            }
        } else if (isLoading) {
            Text(
                "Loading...",
                color = Color.White,
                modifier = Modifier
                    .align(CenterHorizontally)
                    .padding(top = 16.dp)
            )
            Spacer(modifier = Modifier.weight(1f))
        } else {
            Spacer(modifier = Modifier.weight(1f))
        }

        CommonBottomBar(navController = navController)
    }
}


@Composable
fun AddSongScreen(navController: NavController, viewModel: SongsViewModel = viewModel()) {
    var songQuery by remember { mutableStateOf("") }

    Column {
        TextField(
            value = songQuery,
            onValueChange = {
                songQuery = it
                viewModel.autocompleteSong(songQuery)
            },
            label = { Text("Search Song") }
        )

        val suggestions by viewModel.songSuggestions.observeAsState(initial = emptyList())
        val isLoading by viewModel.isLoading.observeAsState(initial = false)

        if (isLoading) {
            CircularProgressIndicator()
        } else {
            LazyColumn {
                items(suggestions ?: emptyList()) { suggestion ->
                    val artistNames = suggestion.artists?.joinToString() ?: "Unknown Artists"
                    Text(text = "${suggestion.track_name} by $artistNames")
                }
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
        horizontalAlignment = CenterHorizontally
    ) {
        Text(text = "Settings", style = MaterialTheme.typography.h4)


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


@OptIn(ExperimentalCoilApi::class)
@Composable
fun ProfileScreen(navController: NavController) {
    val viewModel: ProfileViewModel = viewModel()
    //val friendsList by viewModel.friendsList.observeAsState(initial = emptyList())
    //var newUsername by remember { mutableStateOf("") }
    val user = Firebase.auth.currentUser
    val currentUsername by viewModel.username.observeAsState("Unknown")
    val profilePictureUrl by viewModel.profilePictureURL.observeAsState("Unknown")
    val likedSongs by viewModel.likedSongs.observeAsState(initial = emptyList())

    LaunchedEffect(user?.uid) {
        viewModel.fetchUsername(user?.uid ?: "")
        viewModel.fetchProfilePictureURL(user?.uid ?: "")
        viewModel.fetchLikedSongs(user?.uid ?: "")
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(color = Color(0xFF1D2123))
            .padding(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 15.dp), // Add verticalScroll to enable scrolling
    ) {

        TopNav(navController = navController)
        Spacer(modifier = Modifier.height(16.dp))

        Column( modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .weight(1f) // Takes up all available vertical space
        ) {

            Image(
                painter = rememberImagePainter(data = profilePictureUrl),
                contentDescription = null,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = 49.dp, end = 49.dp, top = 12.dp)
                    .aspectRatio(1f)
                    .clip(shape = RoundedCornerShape(20.dp))
                    .align(CenterHorizontally),
                contentScale = ContentScale.FillBounds
            )

            Spacer(modifier = Modifier.height(6.dp))


            Row(
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .padding(start = 49.dp, end = 49.dp)
                    .fillMaxWidth()
            ) {

                Text(
                    text = currentUsername,
                    style = TextStyle(
                        fontSize = 36.sp,
                        lineHeight = 43.2.sp,
                        fontWeight = FontWeight(400),
                        color = Color(0xFFFFFFFF),
                    ),
                )
            }


            Row(
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .padding(start = 49.dp, end = 49.dp)
                    .fillMaxWidth()
            ) {
                Text(
                    text = "@$currentUsername",
                    style = TextStyle(
                        fontSize = 24.sp,
                        lineHeight = 28.8.sp,
                        fontWeight = FontWeight(400),
                        color = Color(0x80FFFFFF),
                    ),
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            Row{
                Row(
                    horizontalArrangement = Arrangement.spacedBy(10.dp, CenterHorizontally),
                    verticalAlignment = Alignment.CenterVertically,
                    modifier= Modifier
                        .width(90.dp)
                        .height(37.dp)
                        .background(
                            color = Color(0xFFFACD66),
                            shape = RoundedCornerShape(size = 27.dp)
                        )
                        .padding(start = 10.dp, top = 10.dp, end = 10.dp, bottom = 10.dp)
                        .clickable { },
                ){
                    Text(
                        text = "Collection",
                        style = TextStyle(
                            fontSize = 14.sp,
                            lineHeight = 16.8.sp,
                            fontWeight = FontWeight(400),
                            color = Color(0xFF1D2123),
                            textAlign = TextAlign.Center
                        ),
                    )
                }

                Spacer(modifier = Modifier.width(4.dp))

                Row(
                    horizontalArrangement = Arrangement.spacedBy(10.dp, CenterHorizontally),
                    verticalAlignment = Alignment.CenterVertically,
                    modifier= Modifier
                        .border(
                            width = 1.dp,
                            color = Color(0xFFEFEEE0),
                            shape = RoundedCornerShape(size = 27.dp)
                        )
                        .width(90.dp)
                        .height(37.dp)
                        .padding(start = 10.dp, top = 10.dp, end = 10.dp, bottom = 10.dp)
                        .clickable { },
                ){
                    Text(
                        text = "Lists",
                        style = TextStyle(
                            fontSize = 14.sp,
                            lineHeight = 16.8.sp,
                            fontWeight = FontWeight(400),
                            color = Color(0xFFEFEEE0),
                            textAlign = TextAlign.Center
                        ),
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            for (i in likedSongs.indices step 2) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    if (i < likedSongs.size) {
                        DisplaySong(song = likedSongs[i], navController = navController)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    if (i + 1 < likedSongs.size) {
                        DisplaySong(song = likedSongs[i + 1], navController = navController)
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
            }
        }

        CommonBottomBar(navController = navController)
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
    private val _profilePictureURL = MutableLiveData<String>()
    val profilePictureURL: LiveData<String> = _profilePictureURL

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

    fun fetchProfilePictureURL(userId: String) {
        val usersCollection = Firebase.firestore.collection("Users")
        usersCollection.document(userId).get().addOnSuccessListener { documentSnapshot ->
            _profilePictureURL.value =
                documentSnapshot["profile_picture_url"] as? String ?: "Unknown"
        }
    }

    fun addFriend(userId: String, friendUsername: String) {
        val usersCollection = Firebase.firestore.collection("Users")

        // Fetch the friend's information
        usersCollection.whereEqualTo("username", friendUsername).get()
            .addOnSuccessListener { documents ->
                if (!documents.isEmpty) {
                    val friendDocument = documents.documents.first()
                    val friendId = friendDocument.id

                    // Update your friends_list
                    usersCollection.document(userId)
                        .update("friends_list", FieldValue.arrayUnion(friendId))
                        .addOnSuccessListener {
                            // Update your friend's friends_list
                            usersCollection.document(friendId)
                                .update("friends_list", FieldValue.arrayUnion(userId))
                                .addOnSuccessListener {
                                    fetchFriendsList(userId) // Refresh your friends list
                                }
                        }
                }
            }
    }


    private fun fetchFriendsList(userId: String) {
        val usersCollection = Firebase.firestore.collection("Users")
        usersCollection.document(userId).get().addOnSuccessListener { document ->
            val friendIds = document["friends_list"] as? List<*> ?: return@addOnSuccessListener

            // Initialize an empty list to hold the friend data
            val friends = mutableListOf<FriendData>()

            // Fetch each friend's details
            for (id in friendIds) {
                usersCollection.document(id.toString()).get().addOnSuccessListener { friendDoc ->
                    val name = friendDoc["username"] as? String ?: "Unknown"
                    val profilePicUrl =
                        friendDoc["profile_pic_url"] as? String ?: "https://via.placeholder.com/150"

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
                userDocument.set(
                    mapOf(
                        "username" to newUsername,
                        "liked_song_list" to listOf<String>()
                    )
                )
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

        likedSongsCollection.get().addOnSuccessListener { documentSnapshot ->
            // Check if the document exists
            if (documentSnapshot.exists()) {
                // Access the liked_song_list field directly from the DocumentSnapshot
                val likedSongsMap = documentSnapshot["liked_song_list"] as? Map<*, *>

                // Extract song IDs from the liked_song_list field
                val songIds = likedSongsMap?.keys?.map { it.toString() } ?: emptyList()

                // Fetch song details based on the retrieved song IDs
                fetchSongsDetails(songIds)
            } else {
                // Document doesn't exist
                Log.d("Debug", "User document does not exist for userID: $userId")
            }
        }.addOnFailureListener { exception ->
            // Handle failure
            Log.e("Error", "Failed to fetch user document for userID: $userId", exception)
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
    /*
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

     */

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
    @get:PropertyName("acousticness") @set:PropertyName("acousticness") var acousticness: Double? = 0.0,
    @get:PropertyName("liveness") @set:PropertyName("liveness") var liveness: Double? = 0.0,
    @get:PropertyName("loudness") @set:PropertyName("loudness") var loudness: Double? = 0.0,
    @get:PropertyName("mode") @set:PropertyName("mode") var mode: Int? = 0,
    @get:PropertyName("rating") @set:PropertyName("rating") var rating: Double? = 0.0,
    @get:PropertyName("rating_count") @set:PropertyName("rating_count") var ratingCount: Int? = 0,
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

    private val apiService: AutocompleteApiService by lazy {
        RetrofitInstance.retrofit.create(AutocompleteApiService::class.java)
    }

    private val _songs = MutableLiveData<List<Song>>()
    val songs: LiveData<List<Song>> = _songs

    private val _addSongStatus = MutableLiveData<String>()
    val addSongStatus: LiveData<String> = _addSongStatus

    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    val songSuggestions = MutableLiveData<List<Suggestion>>()

    init {
        loadSongs()
    }


    fun autocompleteSong(query: String) {
        viewModelScope.launch {
            _isLoading.value = true  // Modify _isLoading instead of isLoading
            try {
                val response = apiService.autocompleteSong(query)
                if (response.isSuccessful && response.body() != null) {
                    Log.d("API Response", response.body()!!.suggestions.toString())
                    songSuggestions.value = response.body()!!.suggestions
                } else {
                    // Handle error
                }
            } catch (e: Exception) {
                // Handle exception
            } finally {
                _isLoading.value = false  // Modify _isLoading instead of isLoading
            }
        }
    }


    private fun loadSongs() {
        val db = FirebaseFirestore.getInstance()

        db.collection("Tracks")
            .get()
            .addOnSuccessListener { documents ->
                val songsList = documents.mapNotNull { documentSnapshot ->
                    try {
                        val song = documentSnapshot.toObject(Song::class.java)
                        song.let {
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



    fun updateSongs(updatedSongs: List<Song>) {
        _songs.value = updatedSongs
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

    fun loadSongsWithSubstring(substring: String) {
        val db = FirebaseFirestore.getInstance()
        _isLoading.value = true

        db.collection("Tracks")
            .get()
            .addOnSuccessListener { documents ->
                val filteredSongs = documents.mapNotNull { documentSnapshot ->
                    try {
                        val song = documentSnapshot.toObject(Song::class.java)
                        song.apply {
                            // Handle the conversion of rating to Double
                            rating = try {
                                rating?.toString()?.toDoubleOrNull() ?: 0.0
                            } catch (e: NumberFormatException) {
                                Log.e("SongsViewModel", "Error converting rating to double for song $id", e)
                                0.0
                            }
                            id = documentSnapshot.id
                        }
                    } catch (e: Exception) {
                        Log.e("SongsViewModel", "Error parsing song data", e)
                        null
                    }
                }.filter { song ->
                    // Perform a case-insensitive check if trackName contains the substring
                    song.trackName?.lowercase(Locale.getDefault())
                        ?.contains(substring.lowercase(Locale.getDefault())) == true
                }
                _songs.value = filteredSongs
                _isLoading.value = false
            }
            .addOnFailureListener { exception ->
                Log.e("SongsViewModel", "Error loading songs", exception)
            }

    }
}

interface SongsApiService {
    @GET("/search")
    suspend fun searchSongs(@Query("songName") songName: String): Response<List<Song>>
}

interface AutocompleteApiService {
    @GET("/autocomplete")
    suspend fun autocompleteSong(@Query("song") songQuery: String): Response<AutocompleteResponse>
}

data class AutocompleteResponse(val suggestions: List<Suggestion>)

data class Suggestion(
    val track_name: String,
    val artists: List<String>,
    val album_name: String
)
object RetrofitInstance {
    private const val BASE_URL = "http://10.0.2.2:8080" // Replace with your backend URL

    val retrofit: Retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

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
fun StarRating(
    rating: Float,
    onRatingChanged: (Float) -> Unit
) {
    Row(
        modifier = Modifier
            .padding(8.dp),
        horizontalArrangement = Arrangement.spacedBy(4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Display stars
        (1..10).forEach { index ->
            Icon(
                painter = painterResource(
                    id = if (index <= rating) R.drawable.rated else R.drawable.not_rated
                ),
                contentDescription = "Star Rating",
                modifier = Modifier
                    .clickable { onRatingChanged(index.toFloat()) }
                    .size(24.dp)
            )
        }

        // Display rating text
        Text(
            text = "${rating.toInt()}/10",
            style = TextStyle(
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            ),
            modifier = Modifier
                .padding(start = 8.dp)
        )
    }
}



@Suppress("UNCHECKED_CAST")
fun handleRatingUpdate(song: Song, newRating: Double, userId: String, viewModel: SongsViewModel) {
    val songRef = Firebase.firestore.collection("Tracks").document(song.id)
    val userRef = Firebase.firestore.collection("Users").document(userId)
    var formattedRating: Double = 0.0

    Firebase.firestore.runTransaction { transaction ->
        val songSnapshot = transaction.get(songRef)
        val userSnapshot = transaction.get(userRef)

        val currentRating = songSnapshot.getDouble("rating") ?: 0.0
        var ratingCount = songSnapshot.getLong("rating_count") ?: 0

        val ratedSongList = userSnapshot.get("rated_song_list") as? Map<String, Map<String, Any>> ?: emptyMap()
        val userPreviousRating = ratedSongList[song.id]?.get("rating") as? Double

        val updatedRating: Double
        if (userPreviousRating != null) {
            // User has previously rated, adjust existing rating
            updatedRating = ((currentRating * ratingCount) - userPreviousRating + newRating) / ratingCount
        } else {
            // New user rating, increment rating count
            ratingCount += 1
            updatedRating = ((currentRating * (ratingCount - 1)) + newRating) / ratingCount
        }
        formattedRating = "%.2f".format(updatedRating).toDouble()
        transaction.update(songRef, "rating", formattedRating)
        transaction.update(songRef, "rating_count", ratingCount)


        val updatedRatedSongList = ratedSongList.toMutableMap()
        updatedRatedSongList[song.id] = mapOf("rating" to newRating, "timestamp" to FieldValue.serverTimestamp())
        transaction.update(userRef, "rated_song_list", updatedRatedSongList)
    }.addOnSuccessListener {
        viewModel.updateSongs(viewModel.songs.value?.map { if (it.id == song.id) it.copy(rating = formattedRating) else it } ?: listOf())
    }
}


@Suppress("UNCHECKED_CAST")
suspend fun getUserRatingForSong(userId: String?, songId: String): Double? {
    if (userId == null) {
        Log.w("getUserRatingForSong", "UserId is null")
        return null
    }

    val firestore = FirebaseFirestore.getInstance()
    val userRef = firestore.collection("Users").document(userId)

    return try {
        val userSnapshot = userRef.get().await()
        val ratedSongList = userSnapshot.get("rated_song_list") as? Map<String, Map<String, Any>>

        val rating = ratedSongList?.get(songId)?.get("rating") as? Double
        Log.w("getUserRatingForSong", "Current User rating: $rating")
        rating
    } catch (e: Exception) {
        Log.e("getUserRatingForSong", "Error fetching user rating", e)
        null
    }
}








@OptIn(ExperimentalCoilApi::class)
@Composable
fun SongDetailScreen(navController: NavController, songId: String, viewModel: SongsViewModel = viewModel()) {

    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val songs by viewModel.songs.observeAsState(initial = emptyList())
    val song = songs.firstOrNull { it.id == songId }
    val user = Firebase.auth.currentUser
    val userId = user?.uid
    var currentRating by remember { mutableFloatStateOf(0f) }



    LaunchedEffect(songId, userId) {
        coroutineScope.launch {
            // Log the userId and songId


            // Retry logic
            while (isActive) {
                try {
                    val userRating = getUserRatingForSong(userId, songId)
                    Log.d("RatingFetch", "Attempting to fetch rating for userId: $userId and songId: $songId")
                    Log.d("RatingFetch", "Fetched User rating: $userRating for songId: $songId")
                    if (userRating != null) {
                        currentRating = userRating.toFloat()
                        break
                    }
                } catch (e: Exception) {
                    Log.e("RatingFetch", "Error fetching rating", e)
                }

                delay(2000) // wait for 2 seconds before retrying
            }
        }
    }



    fun updateLikeCountLocally(countChange: Int) {
        val updatedSongs = songs.map {
            if (it.id == songId) {
                val currentLikeCount = it.likeCount ?: 0
                it.copy(likeCount = maxOf(0, currentLikeCount + countChange))
            } else {
                it
            }
        }
        viewModel.updateSongs(updatedSongs)
    }

    // State to track whether the song is liked or not
    val isLiked = remember { mutableStateOf(false) }

    val onLikeClick: () -> Unit = {
        val userLc = Firebase.auth.currentUser
        val userIdLc = userLc?.uid

        if (userIdLc != null) {
            if (isLiked.value) {
                // Remove the song from liked songs
                removeLikedSongFromFirestore(userIdLc, songId)
                updateLikeCountLocally(-1)
            } else {
                // Add the song to liked songs
                addLikedSongToFirestore(userIdLc, songId)
                updateLikeCountLocally(1)
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
                        .width(152.dp)
                        .height(64.dp)
                        .background(
                            color = Color(0x5E33373B),
                            shape = RoundedCornerShape(size = 15.dp)
                        )
                ) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(4.dp, Alignment.Start),
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .width(100.dp)
                            .align(Center),
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.rated),
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
                        .background(
                            color = Color(0x5E33373B),
                            shape = RoundedCornerShape(size = 15.dp)
                        )
                ) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(4.dp, CenterHorizontally),
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


// Star Rating UI for user input
            StarRating(rating = currentRating) { newRating ->
                coroutineScope.launch {
                    userId?.let { uid ->
                        if (song != null) {
                            handleRatingUpdate(song, newRating.toDouble(), uid, viewModel)
                            Toast.makeText(context, "Rating updated to $newRating", Toast.LENGTH_SHORT).show()
                        }
                    }
                }
            }


            Spacer(modifier = Modifier.height(16.dp))

            Row(
                horizontalArrangement = Arrangement.spacedBy(16.dp, CenterHorizontally),
                verticalAlignment = Alignment.Top,
            ) {
                Box(
                    modifier = Modifier
                        .width(152.dp)
                        .height(64.dp)
                        .background(
                            color = Color(0xFF1DB954),
                            shape = RoundedCornerShape(size = 15.dp)
                        )
                ){
                    Image(
                        painter = painterResource(id = R.drawable.spotify_logo),
                        contentDescription = "spotify logo",
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
                        contentDescription = "like button",
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
                        contentDescription = "like button",
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
                horizontalArrangement = Arrangement.spacedBy(16.dp, CenterHorizontally),
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
                        .clickable {},
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
                        .clickable {},
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
                        .clickable {},
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
                        .clickable {},
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





//~~~~~~~~~~
//~~~~~~~~~~USERS~~~~~~~~~~
//

data class User(
    var uid: String = "",

    @get:PropertyName("username") @set:PropertyName("username") var username: String? = "",
    @get:PropertyName("profile_picture_url") @set:PropertyName("profile_picture_url") var profilePictureUrl: String? = "",

    // The liked_song_list appears to use a map with song IDs as keys and some object as values.
    // Assuming the values are complex objects, you might have to define a separate data class for them.
    @get:PropertyName("liked_song_list") @set:PropertyName("liked_song_list") var likedSongList: Map<String, Any>? = mapOf(),

    // Same for rated_song_list, it seems to be a map with song IDs as keys and ratings as values.
    @get:PropertyName("rated_song_list") @set:PropertyName("rated_song_list") var ratedSongList: Map<String, Any>? = mapOf(),

    // Assuming friends_list is an array of Strings (user IDs or usernames).
    @get:PropertyName("friends_list") @set:PropertyName("friends_list") var friendsList: List<String>? = listOf(),

    // Assuming comments is an array. You might have to create a separate data class for Comment if it's a complex type.
    @get:PropertyName("comments") @set:PropertyName("comments") var comments: List<String>? = listOf(),

    // Assuming created_songs is an array of song IDs.
    @get:PropertyName("created_songs") @set:PropertyName("created_songs") var createdSongs: List<String>? = listOf(),

    // This field looks like a boolean flag indicating the privacy of the user's profile.
    @get:PropertyName("isprivate") @set:PropertyName("isprivate") var isPrivate: Int? = 0

    // Add other fields as necessary
)
class UsersViewModel : ViewModel() {
    private val _users = MutableLiveData<List<User>>()
    val users: LiveData<List<User>> = _users

    private val _addUserStatus = MutableLiveData<String>()
    val addUserStatus: LiveData<String> = _addUserStatus

    init {
        loadUsers()
    }

    private fun loadUsers() {
        val db = FirebaseFirestore.getInstance()

        db.collection("Users")
            .get()
            .addOnSuccessListener { documents ->
                val usersList = documents.mapNotNull { documentSnapshot ->
                    try {
                        documentSnapshot.toObject(User::class.java)?.apply {
                            uid = documentSnapshot.id
                        }
                    } catch (e: Exception) {
                        Log.e("UsersViewModel", "Error deserializing user", e)
                        null
                    }
                }
                _users.value = usersList
            }
            .addOnFailureListener { exception ->
                Log.e("UsersViewModel", "Error loading users", exception)
            }
    }

    fun updateUsers(updatedUsers: List<User>) {
        _users.value = updatedUsers
    }

    fun addUser(user: User) {
        val db = FirebaseFirestore.getInstance()
        db.collection("Users")
            .add(user)
            .addOnSuccessListener { documentReference ->
                _addUserStatus.value = "User added successfully with ID: ${documentReference.id}"
            }
            .addOnFailureListener { e ->
                _addUserStatus.value = "Error adding user: ${e.message}"
            }
    }

    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    fun loadUsersWithSubstring(substring: String) {
        val db = FirebaseFirestore.getInstance()
        _isLoading.value = true

        db.collection("Users")
            .get()
            .addOnSuccessListener { documents ->
                val filteredUsers = documents.mapNotNull { documentSnapshot ->
                    try {
                        documentSnapshot.toObject(User::class.java)?.apply {
                            uid = documentSnapshot.id
                        }
                    } catch (e: Exception) {
                        Log.e("UsersViewModel", "Error parsing user data", e)
                        null
                    }
                }.filter { user ->
                    user.username?.lowercase(Locale.getDefault())
                        ?.contains(substring.lowercase(Locale.getDefault())) == true
                }
                _users.value = filteredUsers
                _isLoading.value = false
            }
            .addOnFailureListener { exception ->
                Log.e("UsersViewModel", "Error loading users", exception)
            }

    }
}




//-------------------------- API ----------------------

