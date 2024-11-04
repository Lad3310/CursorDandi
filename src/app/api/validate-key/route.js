import { NextResponse } from 'next/server';
import { supabase } from '@/supabaseClient';

export async function POST(request) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key', apiKey)
      .single();

    if (error) {
      console.error('Error validating API key:', error);
      return NextResponse.json({ error: 'Error validating API key' }, { status: 500 });
    }

    return NextResponse.json({
      valid: !!data,
      message: data ? 'Valid API key' : 'Invalid API key'
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}