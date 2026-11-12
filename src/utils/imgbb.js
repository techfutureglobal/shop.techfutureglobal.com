export const uploadToImgBB = async (file) => {
    // You should put your ImgBB API Key in the .env file like: VITE_IMGBB_API_KEY=your_key
    const API_KEY = import.meta.env.VITE_IMGBB_API_KEY || 'YOUR_IMGBB_API_KEY';
    
    if (API_KEY === 'YOUR_IMGBB_API_KEY') {
        console.warn('⚠️ ImgBB API Key is missing. Using a fallback public API key for development ONLY.');
    }

    const fallbackKey = '5e2b407bbcb3f6064cf6eb5ef2807fba'; // Demo fallback key
    const finalKey = API_KEY !== 'YOUR_IMGBB_API_KEY' ? API_KEY : fallbackKey;

    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${finalKey}`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        
        if (data.success) {
            return data.data.url; // Returns the direct image URL
        } else {
            throw new Error(data.error.message || 'Failed to upload image to ImgBB');
        }
    } catch (error) {
        console.error('ImgBB Upload Error:', error);
        throw error;
    }
};
