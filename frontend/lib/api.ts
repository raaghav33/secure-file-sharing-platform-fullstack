// Base URL for the existing backend API.
// Set NEXT_PUBLIC_API_BASE_URL in your environment to point at the real server.
// Falls back to a relative path so requests hit the same origin during local dev.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? ""

export interface UploadResponse {
  code: string
  expiry_seconds: number
}

/** Upload a PDF file. Reports progress via the optional callback. */
export function uploadFile(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append("file", file)

    const xhr = new XMLHttpRequest()
    xhr.open("POST", `${API_BASE_URL}/upload`)

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as UploadResponse
          resolve(data)
        } catch {
          reject(new Error("Received an invalid response from the server."))
        }
      } else {
        reject(new Error(`Upload failed (${xhr.status}). Please try again.`))
      }
    }

    xhr.onerror = () =>
      reject(new Error("Network error. Please check your connection."))

    xhr.send(formData)
  })
}

/** Build the download URL for a given access code. */
export function getDownloadUrl(code: string): string {
  return `${API_BASE_URL}/get/${encodeURIComponent(code.trim())}`
}

/** Verify and download a file by access code. Throws on invalid codes. */
/** Download a file by access code. */
export async function downloadFile(code: string): Promise<void> {
  window.open(getDownloadUrl(code), "_blank")
}
