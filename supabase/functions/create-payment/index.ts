// supabase/functions/create-payment/index.ts
// Deploy this to Supabase Edge Functions
// This function creates a UddoktaPay payment request and returns a redirect URL

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { amount, orderId, method, gateway } = await req.json();

        if (!amount || !orderId) {
            return new Response(JSON.stringify({ error: "amount and orderId are required" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Initialize Supabase with Service Role Key (server-side only)
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        // Load UddoktaPay credentials from our secure table
        const { data: gw, error: gwError } = await supabase
            .from("platform_payment_gateways")
            .select("*")
            .eq("provider", "uddoktapay")
            .single();

        if (gwError || !gw) {
            console.error("Gateway fetch error:", gwError);
            return new Response(JSON.stringify({ error: "UddoktaPay gateway not found in database" }), {
                status: 404,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        if (!gw.is_active) {
            return new Response(JSON.stringify({ error: "UddoktaPay is not active. Please enable it in Payment Settings." }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        if (!gw.app_key) {
            return new Response(JSON.stringify({ error: "UddoktaPay API Key is not configured." }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const siteUrl = Deno.env.get("SITE_URL") || "https://apononline.com";
        const baseUrl = gw.base_url || "https://sandbox.uddoktapay.com";
        const apiKey = gw.app_key;

        console.log(`Creating UddoktaPay payment: Amount=${amount} BDT, OrderID=${orderId}, Base=${baseUrl}`);

        // Create payment via UddoktaPay API v2
        const uddoktaRes = await fetch(`${baseUrl}/api/checkout-v2`, {
            method: "POST",
            headers: {
                "RT-UDDOKTAPAY-API-KEY": apiKey,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({
                full_name: "Customer",
                email: `order-${orderId}@apononline.com`,
                amount: parseFloat(amount).toFixed(2),
                metadata: {
                    orderId: orderId,
                    method: method,
                },
                redirect_url: `${siteUrl}/checkout/success?order=${orderId}`,
                cancel_url: `${siteUrl}/checkout?cancelled=1`,
                webhook_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/payment-webhook`,
            }),
        });

        const uddoktaData = await uddoktaRes.json();
        console.log("UddoktaPay response:", JSON.stringify(uddoktaData));

        if (!uddoktaRes.ok || !uddoktaData.payment_url) {
            console.error("UddoktaPay API error:", uddoktaData);
            return new Response(JSON.stringify({
                error: uddoktaData.message || uddoktaData.error || "UddoktaPay API returned an error",
                details: uddoktaData,
            }), {
                status: 502,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({
            paymentUrl: uddoktaData.payment_url,
            invoiceId: uddoktaData.invoice_id,
        }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (err) {
        console.error("Unhandled error:", err);
        return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
