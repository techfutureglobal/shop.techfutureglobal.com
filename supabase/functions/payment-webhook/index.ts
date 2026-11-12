// supabase/functions/payment-webhook/index.ts
// UddoktaPay Webhook Handler
// This receives payment confirmation from UddoktaPay and marks the order as PAID

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const body = await req.json();
        console.log("UddoktaPay Webhook received:", JSON.stringify(body));

        // UddoktaPay sends: invoice_id, payment_status, transaction_id, metadata
        const { invoice_id, payment_status, transaction_id, metadata, amount } = body;

        if (payment_status !== "COMPLETED") {
            console.log(`Payment status is ${payment_status}, ignoring.`);
            return new Response(JSON.stringify({ status: "ignored", reason: payment_status }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        const orderId = metadata?.orderId;
        if (!orderId) {
            console.warn("No orderId in webhook metadata");
            return new Response(JSON.stringify({ error: "No orderId in metadata" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        // Verify with UddoktaPay API before marking paid (security check)
        const { data: gw } = await supabase
            .from("platform_payment_gateways")
            .select("app_key, base_url")
            .eq("provider", "uddoktapay")
            .single();

        if (gw?.app_key) {
            const verifyRes = await fetch(`${gw.base_url}/api/verify-payment`, {
                method: "POST",
                headers: {
                    "RT-UDDOKTAPAY-API-KEY": gw.app_key,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ invoice_id }),
            });
            const verified = await verifyRes.json();
            console.log("Verification result:", JSON.stringify(verified));

            if (verified.payment_status !== "COMPLETED") {
                return new Response(JSON.stringify({ error: "Payment verification failed" }), {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" }
                });
            }
        }

        // Mark order as Paid in Supabase
        const { error: orderErr } = await supabase
            .from("orders")
            .update({
                status: "Processing",
                payment_status: "Paid",
                transaction_id: transaction_id,
                paid_at: new Date().toISOString()
            })
            .eq("id", orderId);

        if (orderErr) {
            console.error("Order update error:", orderErr);
            return new Response(JSON.stringify({ error: "Failed to update order" }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        console.log(`✅ Order ${orderId} marked as PAID via UddoktaPay. TxnID: ${transaction_id}`);

        return new Response(JSON.stringify({ success: true, orderId, transaction_id }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (err) {
        console.error("Webhook error:", err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
});
