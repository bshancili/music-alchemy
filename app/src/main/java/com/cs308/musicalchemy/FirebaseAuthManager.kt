package com.cs308.musicalchemy
/*


import retrofit2.Callback
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object FirebaseAuthManager {
    private val retrofit = Retrofit.Builder()
        .baseUrl("http://10.0.2.2:3000")
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    private val firebaseApi = retrofit.create(FirebaseApi::class.java)

    fun signUp(email: String, password: String, callback: Callback<SignUpResponse>) {
        val request = SignUpRequest(email, password)
        firebaseApi.signUp(request).enqueue(callback)
    }

    fun signIn(email: String, password: String, callback: Callback<SignInResponse>) {
        val request = SignInRequest(email, password)
        firebaseApi.signIn(request).enqueue(callback)
    }

    fun signInWithGoogle(idToken: String, callback: Callback<SignInResponse>) {
        val request = SignInWithGoogleRequest(idToken)
        firebaseApi.signInWithGoogle(request).enqueue(callback)
    }

    fun signInWithApple(idToken: String, nonce: String?, callback: Callback<SignInResponse>) {
        val request = SignInWithAppleRequest(idToken, nonce)
        firebaseApi.signInWithApple(request).enqueue(callback)
    }

}
*/