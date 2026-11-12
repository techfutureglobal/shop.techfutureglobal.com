export const optimizeBase64Image = (base64Str, maxWidth = 800, quality = 0.6) => {
    return new Promise((resolve, reject) => {
        if (!base64Str || !base64Str.startsWith('data:image')) {
            resolve(base64Str);
            return;
        }
        // If it's already a highly compressed webp, maybe skip to save CPU
        if (base64Str.startsWith('data:image/webp') && base64Str.length < 300000) {
            resolve(base64Str);
            return;
        }

        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = (maxWidth / width) * height;
                width = maxWidth;
            }

            canvas.width = Math.round(width);
            canvas.height = Math.round(height);

            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            try {
                const dataUrl = canvas.toDataURL('image/webp', quality);
                resolve(dataUrl);
            } catch (e) {
                resolve(base64Str); // Fallback
            }
        };
        img.onerror = () => resolve(base64Str); // Safety fallback
    });
};
