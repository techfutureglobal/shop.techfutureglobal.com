export const compressImage = (file, maxWidth = 800, quality = 0.6) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = async () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Simple scaling logic
                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }

                // Ensure even dimensions for better compression
                canvas.width = Math.round(width);
                canvas.height = Math.round(height);

                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Convert to WebP for massive file size reduction
                let dataUrl = '';
                try {
                    dataUrl = canvas.toDataURL('image/webp', quality);
                } catch (e) {
                    dataUrl = canvas.toDataURL('image/jpeg', quality);
                }
                
                // Upload to ImgBB
                try {
                    // Extract base64 part
                    const base64Data = dataUrl.split(',')[1];
                    const API_KEY = '99c17d315351917015da9b5e11f54e06'; // User's ImgBB API Key
                    
                    const formData = new FormData();
                    formData.append('image', base64Data);

                    const response = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
                        method: 'POST',
                        body: formData,
                    });

                    const data = await response.json();
                    
                    if (data.success) {
                        resolve(data.data.url); // Return the final optimized URL!
                    } else {
                        console.warn('ImgBB Upload Failed, falling back to base64:', data.error);
                        resolve(dataUrl);
                    }
                } catch (uploadError) {
                    console.error('ImgBB Network Error:', uploadError);
                    resolve(dataUrl); // Fallback to base64
                }
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};
