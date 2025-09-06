import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '../middleware/errorHandler.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
export const uploadToCloudinary = async (fileBuffer, options = {}) => {
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          ...options
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(fileBuffer);
    });

    return result;
  } catch (error) {
    throw new AppError('Failed to upload file to Cloudinary', 500);
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Public ID of the file
 * @param {string} resourceType - Resource type (image, video, raw)
 * @returns {Promise<Object>} Delete result
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });

    return result;
  } catch (error) {
    throw new AppError('Failed to delete file from Cloudinary', 500);
  }
};

/**
 * Get Cloudinary public ID from URL
 * @param {string} url - Cloudinary URL
 * @returns {string} Public ID
 */
export const getPublicIdFromUrl = (url) => {
  const matches = url.match(/\/v\d+\/(.+)\./);
  return matches ? matches[1] : null;
};

/**
 * Transform image URL
 * @param {string} url - Original URL
 * @param {Object} transformations - Transformation options
 * @returns {string} Transformed URL
 */
export const transformImageUrl = (url, transformations = {}) => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const publicId = getPublicIdFromUrl(url);
  if (!publicId) {
    return url;
  }

  return cloudinary.url(publicId, {
    ...transformations
  });
};
