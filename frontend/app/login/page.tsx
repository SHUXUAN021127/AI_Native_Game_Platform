"use client";

import { useState } from "react";

export default function LoginPage() {

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  async function login() {

      const formData = new URLSearchParams();

      formData.append(
        "username",
        email
      );

      formData.append(
        "password",
        password
      );

      const response = await fetch(
        "http://127.0.0.1:8000/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded"
          },

          body: formData
        }
      );

      if (!response.ok) {

        const error =
          await response.text();

        console.log(error);

        alert("Login Failed");

        return;
      }

      const data =
        await response.json();

      localStorage.setItem(
        "token",
        data.access_token
      );

      alert("Login Success");
  }

  return (
    <main style={{ padding: 20 }}>

      <h1>Login</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <br />
      <br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <br />
      <br />

      <button onClick={login}>
        Login
      </button>

    </main>
  );
}