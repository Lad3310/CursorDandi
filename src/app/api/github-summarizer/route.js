import { NextResponse } from 'next/server';

export async function POST(request) {
  // Get the API key from the request headers
  const apiKey = request.headers.get('x-api-key');

  // Check if API key exists and is valid
  if (!apiKey) {
    return NextResponse.json({ error: 'API key is required' }, { status: 401 });
  }

  // Here you would validate the API key against your valid keys
  // For example, check if it exists in your database or matches your environment variable
  const validApiKey = process.env.API_KEY; // Add this to your .env.local and Vercel
  if (apiKey !== validApiKey) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 403 });
  }

  // If API key is valid, proceed with the request
  try {
    const { githubUrl } = await request.json();
    
    const response = {
      "summary": "GPT Researcher is an autonomous agent designed for comprehensive online research on a variety of tasks. It aims to empower individuals and organizations with accurate, unbiased, and factual information by leveraging the power of AI.",
      "cool_facts": [
        "The agent can produce detailed, factual, and unbiased research reports, with customization options for focusing on relevant resources and outlines.",
        "The project leverages both 'gpt-4o-mini' and 'gpt-4o' (128K context) to complete research tasks, optimizing costs and achieving an average completion time of around 2 minutes."
      ]
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
