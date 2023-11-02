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
import com.google.firebase.FirebaseApp
import com.google.firebase.auth.FirebaseAuth


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
            App()
        }
    }
}


@Composable
fun App() {
    val navController = rememberNavController()
    NavHost(navController, startDestination = "initialMenu") {
        composable("initialMenu") { InitialMenu(navController) }
        composable("login") { LoginScreen(navController) }
        composable("mainMenu") { MainMenu() }
        composable("signUp") { SignUpScreen(navController) }
    }
}

@Composable
fun InitialMenu(navController: NavController) {
    Column {
        Button(onClick = { navController.navigate("login") }) {
            Text(text = "Log in")
        }
        Button(onClick = { navController.navigate("signUp") }) {
            Text(text = "Sign up")
        }
    }
}

@Composable
fun LoginScreen(navController: NavController) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    Column {
        TextField(value = email, onValueChange = { email = it }, label = { Text("Email") })
        TextField(value = password, onValueChange = { password = it }, label = { Text("Password") })
        Button(onClick = {
            Log.d("LoginScreen", "Attempting to sign in with email: $email")
            FirebaseAuth.getInstance().signInWithEmailAndPassword(email, password)
                .addOnCompleteListener { task ->
                    if (task.isSuccessful) {
                        // Sign in success
                        Log.d("LoginScreen", "Sign in successful, navigating to main menu")
                        navController.navigate("mainMenu")
                    } else {
                        // If sign in fails, display a message to the user.
                        Log.w("LoginScreen", "signInWithEmail:failure", task.exception)
                    }
                }
        }) {
            Text(text = "Log in")
        }
    }
}


@Composable
fun MainMenu() {
    Text(text = "Welcome!")
}

@Composable
fun SignUpScreen(navController: NavController) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    Column {
        TextField(value = email, onValueChange = { email = it }, label = { Text("Email") })
        TextField(value = password, onValueChange = { password = it }, label = { Text("Password") })
        Button(onClick = {
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

