import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

// --- AUTOMATED B2C BIKASH PAYOUT ---
// Note: Real bKash B2C API requires corporate partnership. This simulates the call.
serve(async (req) => {
    // CORS configuration
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        // Ensure user is authenticated
        const { data: { user } } = await supabaseClient.auth.getUser()
        if (!user) throw new Error("Unauthorized");

        const body = await req.json()
        const { withdrawalId, amount, mobileNumber } = body

        if (!withdrawalId || !amount || !mobileNumber) {
             throw new Error("Invalid payout parameters");
        }

        const supabaseServiceRoleUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        
        if(!supabaseServiceRoleUrl || !supabaseServiceRoleKey) throw new Error("Server Env Missing");

        const supabaseAdmin = createClient(supabaseServiceRoleUrl, supabaseServiceRoleKey);

        // Security check: Only allow 'admin' to trigger payouts
        const { data: profile } = await supabaseClient.from('profiles').select('role').eq('id', user.id).single();
        if(profile?.role !== 'admin') throw new Error("Only Super Admins can initiate Corporate Payouts.");

        
        const { data: gatewayData, error: dbError } = await supabaseAdmin
            .from('platform_payment_gateways')
            .select('*')
            .eq('provider', 'bkash')
            .eq('is_active', true)
            .single()

        if (dbError || !gatewayData) {
            console.error("Gateway fetch error:", dbError);
            throw new Error("bKash Gateway is not active.");
        }

        // --- B2C PAYOUT SIMULATION ---
        // Normally, you would call bKash B2C APIs here using the appKey and secret from gatewayData
        console.log(`Initiating B2C Transfer: ${amount} BDT to ${mobileNumber}`);
        
        // Simulating a 1.5s network request to the bank
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const fakeTrxId = `B2C-${Date.now().toString().substring(5)}`;

        // -> If Success, Update Withdrawal Request and User Wallet
        const { data: withReq, error: wError } = await supabaseAdmin
           .from('withdrawals')
           .update({ status: 'Completed', transaction_id: fakeTrxId })
           .eq('id', withdrawalId)
           .select('user_id')
           .single()

        if(wError) throw wError;

        // Note: The wallet balance was already deducted safely when the request was made 'Pending' in ShopContext
        console.log(`B2C payout success. Withdrawal ${withdrawalId} completed.`);

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Successfully transferred BDT ${amount} to ${mobileNumber}`,
            transactionId: fakeTrxId
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
