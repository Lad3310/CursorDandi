import { NextResponse } from 'next/server';
import { supabase } from '@/supabaseClient';

export const runtime = 'edge';

// Define allowed methods
const ALLOWED_METHODS = ['POST', 'OPTIONS'];

// Helper function for CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
  'Access-Control-Max-Age': '86400',
};

export async function POST(request) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key is required' }), { 
        status: 401,
        headers: corsHeaders
      });
    }

    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key', apiKey)
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: 'Error validating API key' }), { 
        status: 500,
        headers: corsHeaders
      });
    }

    return new Response(JSON.stringify({
      valid: !!data,
      message: data ? 'Valid API key' : 'Invalid API key'
    }), {
      headers: corsHeaders
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: corsHeaders
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}