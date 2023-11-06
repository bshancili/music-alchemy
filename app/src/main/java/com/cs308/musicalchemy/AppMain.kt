package com.cs308.musicalchemy
import android.app.Application
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

val PastelButtermilk = Color(0xFFF9FBE7)
val PastelLavender = Color(0xFFCEB2FC)

private val appThemeColors = lightColors(
    primary = PastelLavender,
    primaryVariant = PastelLavender,
    secondary = PastelLavender,

    background = PastelButtermilk,
    surface = PastelLavender,
)


// Placeholder data classes
data class UserData(val displayName: String, val email: String, val profilePictureUrl: String)
data class FriendData(val displayName: String, val profilePictureUrl: String)

@Composable
fun AppTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colors = appThemeColors,
        typography = MaterialTheme.typography,
        shapes = MaterialTheme.shapes,
        content = content
    )
}
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
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AppTheme {
                App()
            }
        }
    }
}
@Composable
fun App() {
    val navController = rememberNavController()
    NavHost(navController, startDestination = "initialMenu") {
        composable("initialMenu") { InitialMenu(navController) }
        composable("login") { LoginScreen(navController) }
        composable("mainMenu") { MainMenu(navController) }
        composable("signUp") { SignUpScreen(navController) }
        composable("profile") { ProfileScreen(navController) }
        composable("settings") { SettingsScreen() }
        composable("profile/{friendName}", arguments = listOf(navArgument("friendName") { type = NavType.StringType })) { backStackEntry ->
            val friendName = backStackEntry.arguments?.getString("friendName")
            FriendProfileScreen(friendName = friendName ?: "Unknown") // Replace with a real composable that displays the friend's profile
        }
    }
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
@Composable
fun InitialMenu(navController: NavController) {
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
                        .size(24.dp) // Adjust the size as needed
                        .clip(CircleShape) // Clip as a circle
                )
            } else {
       */




    Column(
        modifier = Modifier
            .background(color = MaterialTheme.colors.background)
            .fillMaxSize(),
    ) {

        Box(modifier = Modifier.fillMaxSize()) {
            // Logo aligned to the top
            Logo(
                modifier = Modifier
                    .align(Alignment.TopCenter)
                    .padding(top = 64.dp) // Adjust the padding to move the logo closer to the top as desired
            )

            // Settings icon on the bottom left
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
    // Add different settings options here
}


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

