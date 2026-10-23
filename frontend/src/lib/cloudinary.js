// Injects a subtle white signature-logo watermark into any Cloudinary delivery URL.
const WATERMARK = "l_Brown_2_bsk3ns,g_south_east,w_0.16,fl_relative,o_58,x_22,y_18";

export function withWatermark(url) {
  if (!url || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/${WATERMARK}/`);
}
