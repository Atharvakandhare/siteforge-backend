const { Jimp } = require('jimp');

/**
 * Compresses a Base64-encoded image string using Jimp.
 * Resizes the image to a maximum width of 800px (retaining aspect ratio),
 * compresses the quality to 80%, and returns the result as a JPEG Base64 string.
 *
 * @param {string} base64Str - The input base64 string (can include data URI scheme prefix).
 * @param {number} maxWidth - The maximum width allowed (default 800).
 * @param {number} quality - JPEG quality between 0 and 100 (default 80).
 * @returns {Promise<string>} - The compressed base64 image string with JPEG prefix.
 */
async function compressBase64Image(base64Str, maxWidth = 800, quality = 80) {
  if (!base64Str || typeof base64Str !== 'string') {
    return base64Str;
  }

  // Remove whitespace and carriage returns
  const cleanBase64 = base64Str.replace(/\s+/g, '');
  if (!cleanBase64) {
    return base64Str;
  }

  try {
    const hasPrefix = cleanBase64.startsWith('data:image/');
    let rawBase64 = cleanBase64;
    let prefix = '';

    if (hasPrefix) {
      const parts = cleanBase64.split(';base64,');
      if (parts.length === 2) {
        prefix = parts[0] + ';base64,';
        rawBase64 = parts[1];
      }
    }

    // Verify it looks like a base64 string
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    if (!base64Regex.test(rawBase64)) {
      return base64Str; // Return original if it is not valid base64
    }

    const buffer = Buffer.from(rawBase64, 'base64');
    const image = await Jimp.read(buffer);

    // Resize image if it exceeds maximum width (maintaining aspect ratio)
    if (image.width > maxWidth) {
      image.resize({ w: maxWidth });
    }

    // Create a solid white background image of the same size to flatten transparency to white
    // instead of defaulting to black in the JPEG output
    const whiteBg = new Jimp({ width: image.width, height: image.height, color: 0xFFFFFFFF });
    whiteBg.composite(image, 0, 0);

    // Get the JPEG buffer (converting to JPEG is highly optimal for database storage size)
    const compressedBuffer = await whiteBg.getBuffer('image/jpeg', { quality: quality });
    const compressedBase64 = compressedBuffer.toString('base64');

    // Return with the standard JPEG data URI scheme prefix
    return 'data:image/jpeg;base64,' + compressedBase64;
  } catch (error) {
    console.error('Jimp image compression failed:', error);
    return base64Str; // Return original as a fallback on any processing error
  }
}

module.exports = {
  compressBase64Image,
};
