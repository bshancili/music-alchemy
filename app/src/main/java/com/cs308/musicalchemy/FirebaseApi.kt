package com.cs308.musicalchemy
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.POST

interface FirebaseApi {
    @POST("/signup")
    fun signUp(@Body request: SignUpRequest): Call<SignUpResponse>

    @POST("/signin")
    fun signIn(@Body request: SignInRequest): Call<SignInResponse>
}

data class SignUpRequest(val email: String, val password: String)
data class SignUpResponse(val uid: String)

data class SignInRequest(val email: String, val password: String)
data class SignInResponse(val customToken: String, val status: String, val uid: String)
