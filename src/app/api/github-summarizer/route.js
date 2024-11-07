import { supabase } from '@/supabaseClient';

export const runtime = 'edge';

// Helper function for CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
  'Access-Control-Max-Age': '86400',
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

export async function POST(request) {
  try {
    const apiKey = request.headers.get('x-api-key');
    const { githubUrl } = await request.json();

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key is required' }), { 
        status: 401,
        headers: corsHeaders
      });
    }

    // Validate API key against Supabase
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key', apiKey)
      .single();

    if (keyError || !keyData) {
      return new Response(JSON.stringify({ error: 'Invalid API key' }), { 
        status: 403,
        headers: corsHeaders
      });
    }

    if (!process.env.GITHUB_TOKEN) {
      throw new Error('GitHub token is not configured');
    }

    // Extract owner and repo from GitHub URL
    const urlParts = githubUrl.split('/');
    const owner = urlParts[urlParts.length - 2];
    const repo = urlParts[urlParts.length - 1];

    // Fetch repository data
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    if (!repoResponse.ok) {
      const errorData = await repoResponse.text();
      console.error('GitHub API Error:', errorData);
      throw new Error(`GitHub API error: ${repoResponse.status} ${repoResponse.statusText}`);
    }

    const repoData = await repoResponse.json();

    // Update API key usage count
    await supabase
      .from('api_keys')
      .update({ usage: (keyData.usage || 0) + 1 })
      .eq('id', keyData.id);

    return new Response(JSON.stringify({
      repository: repoData.full_name,
      url: githubUrl,
      stats: {
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        language: repoData.language,
        openIssues: repoData.open_issues_count,
        description: repoData.description,
        topics: repoData.topics,
        lastUpdated: new Date(repoData.updated_at).toLocaleDateString()
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}