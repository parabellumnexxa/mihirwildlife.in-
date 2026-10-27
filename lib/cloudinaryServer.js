import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export function generateSignature(folder = 'portfolio/photos') {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = {
    folder,
    timestamp,
  };
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );

  return {
    signature,
    timestamp,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    folder,
  };
}

export function generateShareCard(publicId, title = 'Wildlife') {
  const subtitle = 'MIHIR RANVA PHOTOGRAPHY';
  return cloudinary.url(publicId, {
    transformation: [
      { width: 1200, height: 1200, crop: 'fill', gravity: 'auto' },
      { effect: 'brightness:-28' },
      {
        overlay: 'Brown_2_bsk3ns',
        width: 0.2,
        flags: 'relative',
        gravity: 'north_west',
        x: 55,
        y: 50,
        opacity: 92,
      },
      {
        overlay: { font_family: 'Georgia', font_size: 42, text: title },
        color: 'white',
        gravity: 'south_west',
        x: 60,
        y: 150,
        width: 1040,
        crop: 'fit',
      },
      {
        overlay: { font_family: 'Arial', font_size: 26, letter_spacing: 6, text: subtitle },
        color: '#C9A25E',
        gravity: 'south_west',
        x: 62,
        y: 90,
      },
    ],
    secure: true,
    format: 'jpg',
  });
}
