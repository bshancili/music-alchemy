package com.cs308.musicalchemy
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.POST

interface FirebaseApi {
    @POST("/signup")
    fun signUp(@Body request: SignUpRequest): Call<SignUpResponse>

}

data class SignUpRequest(val email: String, val password: String)
data class SignUpResponse(val uid: String)
