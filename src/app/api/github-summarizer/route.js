import { NextResponse } from 'next/server';

export async function POST(request) {
  const apiKey = request.headers.get('x-api-key');

  if (!apiKey) {
    return NextResponse.json({ error: 'API key is required' }, { status: 401 });
  }

  const validApiKey = process.env.API_KEY;
  if (apiKey !== validApiKey) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 403 });
  }

  try {
    const { githubUrl } = await request.json();
    
    if (!process.env.GITHUB_TOKEN) {
      throw new Error('GitHub token is not configured');
    }
    
    // Extract owner and repo from GitHub URL
    const urlParts = githubUrl.split('/');
    const owner = urlParts[urlParts.length - 2];
    const repo = urlParts[urlParts.length - 1];

    console.log(`Fetching data for ${owner}/${repo}`);

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

    // Generate dynamic response
    const response = {
      "summary": repoData.description || "No description available",
      "cool_facts": [
        `This repository has ${repoData.stargazers_count} stars and ${repoData.forks_count} forks.`,
        `Primary language: ${repoData.language || 'Not specified'}`,
        `Created by ${owner} and last updated on ${new Date(repoData.updated_at).toLocaleDateString()}`,
        `Open issues: ${repoData.open_issues_count}`
      ]
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error details:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
