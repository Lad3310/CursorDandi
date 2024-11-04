import { NextResponse } from 'next/server';
import { OpenAI } from '@langchain/openai';
import { supabase } from '@/supabaseClient';

export async function POST(request) {
  try {
    const apiKey = request.headers.get('x-api-key');
    const { githubUrl } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 401 });
    }

    // Validate API key against Supabase
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key', apiKey)
      .single();

    if (keyError || !keyData) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 403 });
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

    // Initialize LangChain with OpenAI
    const model = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0.7,
    });

    // Generate summary using LangChain
    const prompt = `Analyze this GitHub repository and provide a detailed summary:
    Name: ${repoData.name}
    Description: ${repoData.description}
    Stars: ${repoData.stargazers_count}
    Language: ${repoData.language}
    Topics: ${repoData.topics?.join(', ')}
    Forks: ${repoData.forks_count}
    Open Issues: ${repoData.open_issues_count}
    Last Updated: ${new Date(repoData.updated_at).toLocaleDateString()}`;

    const summary = await model.invoke(prompt);

    // Update API key usage count
    await supabase
      .from('api_keys')
      .update({ usage: (keyData.usage || 0) + 1 })
      .eq('id', keyData.id);

    return NextResponse.json({
      summary,
      repository: repoData.full_name,
      url: githubUrl,
      stats: {
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        language: repoData.language,
        openIssues: repoData.open_issues_count
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}