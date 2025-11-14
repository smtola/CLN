import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: "https://c0be857c72c40b30ed3fd6419f8a38e5.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: "fba85a360df539383b60515209d297b3",
    secretAccessKey: 'f019529587ba239492ce94f5dea68eb37649b2065dbd98b515a76a0a465f9dea',
  },
  // Force path-style addressing for R2 compatibility
  forcePathStyle: true,
});

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export const uploadFile = async (
  file: File,
  folder = "products",
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  const fileName = `${folder}/${Date.now()}-${file.name}`;
  const fileSize = file.size;
  
  // Start progress at 0%
  if (onProgress) {
    onProgress({
      loaded: 0,
      total: fileSize,
      percentage: 0,
    });
  }

  // For S3 SDK v3, PutObjectCommand doesn't support native progress tracking
  // We'll simulate progress during upload, then complete it when done
  // For better accuracy, consider using multipart upload for large files
  let progressInterval: NodeJS.Timeout | null = null;
  
  if (onProgress) {
    let simulatedProgress = 0;
    progressInterval = setInterval(() => {
      // Simulate progress up to 90% (save 10% for completion)
      if (simulatedProgress < 90) {
        simulatedProgress = Math.min(simulatedProgress + 5, 90);
        onProgress({
          loaded: Math.round((simulatedProgress / 100) * fileSize),
          total: fileSize,
          percentage: simulatedProgress,
        });
      }
    }, 200);
  }

  try {
    // Convert File to Uint8Array for browser compatibility
    // AWS SDK v3 in browser requires Uint8Array instead of File/Blob to avoid stream issues
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    await s3.send(
      new PutObjectCommand({
        Bucket: 'cln',
        Key: fileName,
        Body: uint8Array,
        ContentType: file.type,
      })
    );

    // Complete progress to 100%
    if (onProgress) {
      onProgress({
        loaded: fileSize,
        total: fileSize,
        percentage: 100,
      });
    }

    return `https://pub-1c4ff69dd3854276a9cfd030c632439c.r2.dev/${fileName}`;
  } catch (error) {
    // Report error in progress if callback exists
    if (onProgress) {
      onProgress({
        loaded: 0,
        total: fileSize,
        percentage: 0,
      });
    }
    
    // Provide more detailed error information
    let errorMessage = "Failed to upload file";
    
    if (error instanceof Error) {
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        errorMessage = "Network error: Unable to connect to storage. This may be a CORS issue. Please check your Cloudflare R2 CORS configuration.";
      } else if (error.message.includes("CORS")) {
        errorMessage = "CORS error: The storage bucket needs to allow requests from this domain. Please configure CORS on your Cloudflare R2 bucket.";
      } else {
        errorMessage = `Upload failed: ${error.message}`;
      }
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String(error.message);
    }
    
    const uploadError = new Error(errorMessage);
    uploadError.name = error instanceof Error ? error.name : "UploadError";
    throw uploadError;
  } finally {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
  }
};

/**
 * Delete a file from R2 storage
 * @param fileUrl - The full URL of the file to delete (e.g., https://pub-1c4ff69dd3854276a9cfd030c632439c.r2.dev/products/1234567890-filename.jpg)
 * @returns Promise that resolves when the file is deleted
 */
export const deleteFile = async (fileUrl: string): Promise<void> => {
  try {
    // Extract the file key from the URL
    // URL format: https://pub-1c4ff69dd3854276a9cfd030c632439c.r2.dev/products/1234567890-filename.jpg
    const url = new URL(fileUrl);
    // Get the pathname and remove leading slash (e.g., "products/1234567890-filename.jpg")
    const fileKey = url.pathname.substring(1);
    
    if (!fileKey) {
      throw new Error("Invalid file URL: could not extract file key");
    }

    await s3.send(
      new DeleteObjectCommand({
        Bucket: 'cln',
        Key: fileKey,
      })
    );
  } catch (error) {
    // Provide more detailed error information
    let errorMessage = "Failed to delete file";
    
    if (error instanceof Error) {
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        errorMessage = "Network error: Unable to connect to storage.";
      } else {
        errorMessage = `Delete failed: ${error.message}`;
      }
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String(error.message);
    }
    
    const deleteError = new Error(errorMessage);
    deleteError.name = error instanceof Error ? error.name : "DeleteError";
    throw deleteError;
  }
};

/**
 * Delete multiple files from R2 storage
 * @param fileUrls - Array of file URLs to delete
 * @returns Promise that resolves when all files are deleted (or attempted)
 */
export const deleteFiles = async (fileUrls: string[]): Promise<void> => {
  // Delete all files in parallel, but don't fail if one fails
  const deletePromises = fileUrls.map(url => 
    deleteFile(url).catch(error => {
      console.error(`Failed to delete file ${url}:`, error);
      // Continue with other deletions even if one fails
      return Promise.resolve();
    })
  );
  
  await Promise.all(deletePromises);
};

