import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, api-key, secret-key",
};

serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { method, url, headers, body } = await req.json();

        if (!url) {
            return new Response(JSON.stringify({ error: "URL is required" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        console.log(`Proxying ${method} request to: ${url}`);

        const response = await fetch(url, {
            method: method || "GET",
            headers: headers || {},
            body: body ? JSON.stringify(body) : undefined,
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (err) {
        console.error("Proxy error:", err);
        return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
