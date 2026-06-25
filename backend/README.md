# Secure File Sharing Platform

A cloud-based file sharing platform built using FastAPI and Google Cloud Storage. Users can upload PDF files, receive a unique access code, and securely retrieve files using that code. Files are stored in Google Cloud Storage and can be configured to expire automatically.

## Features

* Upload PDF files to Google Cloud Storage
* Generate unique access codes for file retrieval
* Retrieve files using access codes
* Signed upload URLs for secure uploads
* Signed download URLs for secure downloads
* Temporary file hosting with configurable expiry
* REST API built with FastAPI

## Tech Stack

* Python
* FastAPI
* Google Cloud Storage (GCS)
* Uvicorn
* REST APIs
* Git & GitHub

## API Endpoints

### Upload File

POST `/upload`

Uploads a PDF and returns a unique access code.

### Retrieve File

GET `/get/{code}`

Retrieves a file using its access code.

### Generate Signed Upload URL

GET `/signed-upload-url`

Generates a secure upload URL for direct uploads to GCS.

### Cleanup Expired Files

POST `/cleanup`

Removes expired files from storage.

## Project Status

Backend MVP Completed

Verified Functionality:

* File upload
* File retrieval
* Unique code generation
* Google Cloud Storage integration
* Signed URL workflow

Planned Improvements:

* Modern React frontend
* Drag-and-drop uploads
* Deployment
* Enhanced security and monitoring

## Author

Raaghav Baskaran



