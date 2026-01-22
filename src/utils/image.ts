export async function standardizeProductImage(file: File, size: number): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const minSide = Math.min(bitmap.width, bitmap.height);
  const sx = Math.floor((bitmap.width - minSide) / 2);
  const sy = Math.floor((bitmap.height - minSide) / 2);

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return file;
  }

  ctx.drawImage(bitmap, sx, sy, minSide, minSide, 0, 0, size, size);

  const blob: Blob | null = await new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/webp', 0.85);
  });

  if (!blob) {
    return file;
  }

  const nameBase = file.name.replace(/\.[^/.]+$/, '');
  return new File([blob], `${nameBase}-${size}.webp`, { type: 'image/webp' });
}

