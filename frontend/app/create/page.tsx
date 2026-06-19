"use client";

import { useState, useEffect } from "react";

export default function CreatePage() {

const [title, setTitle] = useState("");
const [description, setDescription] = useState("");

const [loading, setLoading] = useState(false);

const [logs, setLogs] =
  useState<string[]>([]);

const [result, setResult] =
  useState<any>(null);

const [file, setFile] =
  useState<File | null>(null);

const [image, setImage] =
  useState<File | null>(null);

const [video, setVideo] =
  useState<File | null>(null);

const [imagePreview,
  setImagePreview] =
  useState("");

const [videoPreview,
  setVideoPreview] =
  useState("");

const [uploading,
  setUploading] =
  useState(false);

const [uploadedFileUrl,
  setUploadedFileUrl] =
  useState("");

const [uploadedImageUrl,
  setUploadedImageUrl] =
  useState("");

const [uploadedVideoUrl,
  setUploadedVideoUrl] =
  useState("");

useEffect(() => {

const token =
  localStorage.getItem("token");

if (!token) {

  alert("Please login first");

  window.location.href =
    "/login";
}


}, []);

useEffect(() => {

  const role =
    localStorage.getItem(
      "role"
    );

  if (
    role !== "creator"
  ) {

    alert(
      "Creator only"
    );

    window.location.href =
      "/";

  }

}, []);

async function uploadFile() {

  if (!file) return;

  try {

    setUploading(true);

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    const response =
      await fetch(
        "http://127.0.0.1:8000/upload",
        {
          method: "POST",
          body: formData
        }
      );

    const data =
      await response.json();

    setUploadedFileUrl(
      data.url
    );

    alert(
      "Upload Success"
    );

  } catch (error) {

    console.error(error);

  } finally {

    setUploading(false);

  }
}

async function uploadImage() {

  if (!image) return;

  try {

    const formData =
      new FormData();

    formData.append(
      "file",
      image
    );

    const response =
      await fetch(
        "http://127.0.0.1:8000/upload",
        {
          method: "POST",
          body: formData
        }
      );

    const data =
      await response.json();

    setUploadedImageUrl(
      data.url
    );

    alert(
      "Image Uploaded"
    );

  } catch (error) {

    console.error(error);

  }
}

async function uploadVideo() {

  if (!video) return;

  try {

    const formData =
      new FormData();

    formData.append(
      "file",
      video
    );

    const response =
      await fetch(
        "http://127.0.0.1:8000/upload",
        {
          method: "POST",
          body: formData
        }
      );

    const data =
      await response.json();

    setUploadedVideoUrl(
      data.url
    );

    alert(
      "Video Uploaded"
    );

  } catch (error) {

    console.error(error);

  }
}

async function createGame() {

  try {

    setLoading(true);

    setLogs([]);

    setResult(null);

    setLogs(prev => [
      ...prev,
      "🧠 Planner Agent Started"
    ]);

    await new Promise(
      resolve =>
        setTimeout(resolve, 800)
    );

    setLogs(prev => [
      ...prev,
      "✅ Planner Agent Finished"
    ]);

    const token =
      localStorage.getItem(
        "token"
      );

    if (!token) {

      alert(
        "Please login first"
      );

      window.location.href =
        "/login";

      return;
    }

    setLogs(prev => [
      ...prev,
      "🎨 Generator Agent Started"
    ]);

    const response =
      await fetch(
        "http://127.0.0.1:8000/games",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`
          },

          body: JSON.stringify({
            title,
            description
          })
        }
      );

    const data =
      await response.json();

    setLogs(prev => [
      ...prev,
      "✅ Generator Agent Finished"
    ]);

    setLogs(prev => [
      ...prev,
      "🔍 Reviewer Agent Started"
    ]);

    await new Promise(
      resolve =>
        setTimeout(resolve, 500)
    );

    setLogs(prev => [
      ...prev,
      "✅ Reviewer Agent Passed"
    ]);

    setResult(data);

  } catch (error) {

    console.error(error);

    setLogs(prev => [
      ...prev,
      "❌ Generation Failed"
    ]);

  } finally {

    setLoading(false);

  }
}

return (


<main
  style={{
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "40px"
  }}
>

  <div
    style={{
      maxWidth: "900px",
      margin: "0 auto"
    }}
  >

    <h1
      style={{
        fontSize: "48px",
        fontWeight: "bold",
        background:
          "linear-gradient(90deg,#6366f1,#8b5cf6)",
        WebkitBackgroundClip:
          "text",
        color: "transparent",
        marginBottom: "12px"
      }}
    >
      ✨ AI Game Creator
    </h1>

    <p
      style={{
        color: "#64748b",
        marginBottom: "32px"
      }}
    >
      Describe your idea and let
      AI build a playable game.
    </p>

    <div
      style={{
        background: "white",
        borderRadius: "20px",
        padding: "24px",
        boxShadow:
          "0 8px 24px rgba(0,0,0,0.08)"
      }}
    >

      <label>
        Game Title
      </label>

      <input
        placeholder="e.g. Snake Game"
        value={title}
        onChange={(e) =>
          setTitle(
            e.target.value
          )
        }
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "12px",
          border:
            "1px solid #ddd",
          marginTop: "8px",
          marginBottom: "20px"
        }}
      />

      <label>
        Game Idea
      </label>

      <textarea
        placeholder="Describe your game..."
        value={description}
        onChange={(e) =>
          setDescription(
            e.target.value
          )
        }
        style={{
          width: "100%",
          minHeight: "160px",
          padding: "14px",
          borderRadius: "12px",
          border:
            "1px solid #ddd",
          marginTop: "8px"
        }}
      />

      <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3,240px)",
            justifyContent:"center",
            gap: "12px",
            marginTop: "24px"
          }}
        >

          {/* File */}

          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "20px",
              textAlign: "center"
            }}
          >
            <div
              style={{
                fontSize: "32px"
              }}
            >
              📄
            </div>

            <h3>Document</h3>

            <input
              type="file"
              onChange={(e) =>
                setFile(
                  e.target.files?.[0] || null
                )
              }
              style={{
                marginTop: "10px"
              }}
            />

            {
              file && (
                <p
                  style={{
                    marginTop: "10px",
                    fontSize: "13px",
                    color: "#64748b"
                  }}
                >
                  {file.name}
                </p>
              )
            }

            <button
              onClick={uploadFile}
              disabled={!file || uploading}
              style={{
                marginTop: "12px",
                padding: "8px 14px",
                border: "none",
                borderRadius: "8px",
                background: "#2563eb",
                color: "white",
                cursor: "pointer"
              }}
            >
              Upload
            </button>

            {
              uploadedFileUrl && (
                <p
                  style={{
                    color: "#16a34a",
                    marginTop: "8px"
                  }}
                >
                  ✅ Uploaded
                </p>
              )
            }
          </div>

          {/* Image */}

          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "20px",
              textAlign: "center"
            }}
          >
            <div
              style={{
                fontSize: "32px"
              }}
            >
              🖼
            </div>

            <h3>Image</h3>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {

                const selected =
                  e.target.files?.[0];

                if (!selected) return;

                setImage(selected);

                setImagePreview(
                  URL.createObjectURL(
                    selected
                  )
                );
              }}
              style={{
                marginTop: "10px"
              }}
            />

            {
              imagePreview && (

                <img
                  src={imagePreview}
                  alt="preview"
                  style={{
                    width: "100%",
                    marginTop: "10px",
                    borderRadius: "10px",
                    maxHeight: "120px",
                    objectFit: "cover"
                  }}
                />

              )
            }

            <button
              onClick={uploadImage}
              disabled={!image}
              style={{
                marginTop: "12px",
                padding: "8px 14px",
                border: "none",
                borderRadius: "8px",
                background: "#2563eb",
                color: "white",
                cursor: "pointer"
              }}
            >
              Upload
            </button>

            {
              uploadedImageUrl && (
                <p
                  style={{
                    color: "#16a34a",
                    marginTop: "8px"
                  }}
                >
                  ✅ Uploaded
                </p>
              )
            }
          </div>

          {/* Video */}

          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "20px",
              textAlign: "center"
            }}
          >
            <div
              style={{
                fontSize: "32px"
              }}
            >
              🎥
            </div>

            <h3>Video</h3>

            <input
              type="file"
              accept="video/*"
              onChange={(e) => {

                const selected =
                  e.target.files?.[0];

                if (!selected) return;

                setVideo(selected);

                setVideoPreview(
                  URL.createObjectURL(
                    selected
                  )
                );
              }}
              style={{
                marginTop: "10px"
              }}
            />

            {
              videoPreview && (

                <video
                  controls
                  style={{
                    width: "100%",
                    marginTop: "10px",
                    borderRadius: "10px",
                    maxHeight: "120px"
                  }}
                >
                  <source
                    src={videoPreview}
                  />
                </video>

              )
            }

            <button
              onClick={uploadVideo}
              disabled={!video}
              style={{
                marginTop: "12px",
                padding: "8px 14px",
                border: "none",
                borderRadius: "8px",
                background: "#2563eb",
                color: "white",
                cursor: "pointer"
              }}
            >
              Upload
            </button>

            {
              uploadedVideoUrl && (
                <p
                  style={{
                    color: "#16a34a",
                    marginTop: "8px"
                  }}
                >
                  ✅ Uploaded
                </p>
              )
            }
          </div>

        </div>

        <div
          style={{
            marginTop: "50px",
            marginBottom: "20px",
            textAlign: "center"
          }}
        >

          <p
            style={{
              color: "#64748b",
              marginBottom: "18px",
              fontSize: "15px"
            }}
          >
            Describe your idea and let AI create a playable game
          </p>

          <button
            onClick={createGame}
            disabled={loading}
            style={{
              width: "360px",
              maxWidth: "100%",
              height: "60px",
              fontSize: "24px",
              fontWeight: "bold",
              border: "none",
              borderRadius: "20px",
              background:
                loading
                  ? "#94a3b8"
                  : "linear-gradient(90deg,#6366f1,#8b5cf6)",
              color: "white",
              cursor: "pointer",
              boxShadow:
                "0 15px 35px rgba(99,102,241,0.35)"
            }}
          >
            {
              loading
                ? "⏳ Generating Game..."
                : "🚀 Generate Game"
            }
          </button>

        </div>

    {logs.length > 0 && (

      <div
        style={{
          marginTop: "24px",
          background: "white",
          borderRadius: "20px",
          padding: "20px",
          boxShadow:
            "0 8px 24px rgba(0,0,0,0.08)"
        }}


      >

        <h3
          style={{
            marginBottom: "16px"
          }}
        >
          🤖 Agent Workflow
        </h3>

        {
          logs.map((log, index) => (

            <div
              key={index}
              style={{
                padding: "12px",
                marginBottom: "10px",
                background: "#f8fafc",
                borderRadius: "10px",
                border: "1px solid #e2e8f0"
              }}
            >
              {log}
            </div>

          ))
        }

      </div>

    )}
      </div>

    {result && (

      <div
        style={{
          marginTop: "24px",
          background: "white",
          borderRadius: "20px",
          padding: "20px",
          boxShadow:
            "0 8px 24px rgba(0,0,0,0.08)"
        }}
      >

        <h2>
          ✅ Game Created
        </h2>

        <p>
          {result.title}
        </p>

        <button
          style={{
            background:
              "linear-gradient(90deg,#10b981,#14b8a6)",
            color: "white",
            border: "none",
            padding: "12px 20px",
            borderRadius: "10px",
            cursor: "pointer"
          }}
          onClick={() =>
            window.open(
              `http://127.0.0.1:8000${result.play_url}`
            )
          }
        >
          ▶ Play Game
        </button>

      </div>

    )}

  </div>

</main>


);
}
