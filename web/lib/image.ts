const MAX_SOURCE_BYTES = 8 * 1024 * 1024; // 8MB

interface CompressOptions {
  maxDim?: number;
  quality?: number;
}

/**
 * Reads an image file and returns a resized JPEG data URL. There is no
 * real object storage backing this app yet, so uploaded speaker photos are
 * kept small enough to live safely inside the mock localStorage state
 * (swap for a real Storage upload once Supabase is wired in).
 */
export async function fileToCompressedDataUrl(file: File, options: CompressOptions = {}): Promise<string> {
  const { maxDim = 480, quality = 0.82 } = options;

  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있습니다.");
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error("파일 용량이 너무 큽니다 (최대 8MB).");
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("이미지를 처리할 수 없습니다.");
    ctx.drawImage(img, 0, 0, width, height);

    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("이미지를 불러올 수 없습니다."));
    img.src = src;
  });
}
