export const generateAIResponse = async (userMessage, allProducts, customPrompt = '', retryCount = 0, customApiKey = '') => {
    const apiKey = customApiKey || import.meta.env.VITE_GEMINI_API_KEY;
    const lowerMsg = userMessage.toLowerCase().trim();

    // 1. ROBUST LOCAL SEARCH (No API Required)
    // We search for products that match common keywords in the user's message
    const searchTerms = lowerMsg.split(/\s+/).filter(word => word.length > 2);
    
    // Find all matching products in the whole database locally
    const matches = (allProducts || []).filter(p => 
        searchTerms.some(term => p.title.toLowerCase().includes(term))
    );

    if (matches.length > 0) {
        console.log(`🔍 Local match found for "${userMessage}". Skipping API...`);
        let response = `হ্যাঁ, আমাদের কাছে এটি আছে! \n\n`;
        matches.slice(0, 3).forEach(m => {
            response += `• ${m.title}\nমূল্য: ৳${m.price}\n\n`;
        });
        response += `আপনি এটি সরাসরি অর্ডার করতে পারেন বা কোনো প্রশ্ন থাকলে আমাদের জানাতে পারেন।`;
        return response;
    }

    // 2. CONVERSATIONAL FALLBACK (Simple Greetings)
    const greetings = ['hi', 'hello', 'hey', 'হ্যালো', 'হাই', 'কেমন আছো', 'সালাম'];
    if (greetings.some(g => lowerMsg.includes(g)) && lowerMsg.split(' ').length < 3) {
        return "হ্যালো! Ebaybd-এ আপনাকে স্বাগতম। আপনি কি কোনো নির্দিষ্ট প্রোডাক্ট খুঁজছেন?";
    }

    // 3. GEMINI AI FALLBACK (Only for complex or non-product queries)
    if (!apiKey) {
        console.warn("AI Key missing. Local search failed.");
        return "দুঃখিত, আমি আপনার প্রশ্নের উত্তরটি এই মুহূর্তে খুঁজে পাচ্ছি না। দয়াকরে কোনো প্রোডাক্টের নাম লিখে সার্চ দিন।";
    }

    try {
        // Optimize context for Gemini: Only pick first 20 products if no local match
        const productContext = (allProducts || [])
            .slice(0, 20)
            .map(p => `- ${p.title.substring(0, 40)}: ৳${p.price}`)
            .join('\n');
        
        const systemPrompt = `You are a shopping assistant for "Ebaybd". 
Only answer based on these products:
${productContext}

${customPrompt}

Answer in Bengali clearly. Customer asked: "${userMessage}"`;

        // Using 1.5 flash for better stability - API 2.0 has strict RPM limits on free tier
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }],
                generationConfig: { temperature: 0.4, maxOutputTokens: 250 }
            })
        });

        // HANDLE RATE LIMITING
        if (response.status === 429) {
            console.warn("Gemini 429: Rate Limit Hit. Local search failed.");
            if (retryCount < 2) {
                await new Promise(r => setTimeout(r, 3000));
                return await generateAIResponse(userMessage, allProducts, customPrompt, retryCount + 1, apiKey);
            }
            return "দুঃখিত, বর্তমানে আমাদের AI সার্ভিসটি অনেক বেশি চাপের মধ্যে আছে। দয়া করে কোনো নির্দিষ্ট প্রোডাক্টের নাম লিখে ট্রাই করুন।";
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "দুঃখিত, আমি এই মুহূর্তে উত্তরটি দিতে পারছি না। সরাসরি মেসেজ দিন।";
    } catch (e) {
        console.error("AI Fetch Failure:", e);
        return "সার্ভারে সমস্যা হয়েছে। আমাদের সাপোর্ট টিমের সাথে কথা বলুন।";
    }
};
