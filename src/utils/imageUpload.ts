import imageCompression from 'browser-image-compression';

export async function compressAndUploadImage(file: File): Promise<string> {
  try {
    // 1. Compress the image
    const options = {
      maxSizeMB: 0.5, // Max size 500KB
      maxWidthOrHeight: 1080, // Max width/height 1080px
      useWebWorker: false, // Desactivado para evitar problemas de seguridad en iframes (AI Studio)
    };
    
    const compressedFile = await imageCompression(file, options);
    
    // 2. Convert to Base64 to send to our server
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });

    // 3. Upload to our server endpoint which will upload to Vercel Blob
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Image: base64,
        filename: compressedFile.name || `upload-${Date.now()}.jpg`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.url; // This will be the Vercel Blob URL or the Base64 string fallback
  } catch (error) {
    console.error('Error in compressAndUploadImage:', error);
    throw error;
  }
}
