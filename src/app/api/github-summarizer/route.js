import { createGitHubSummaryChain } from './chain';

async function fetchReadmeContent(githubUrl) {
  // Extract owner and repo from GitHub URL
  const urlParts = githubUrl.replace('https://github.com/', '').split('/');
  const owner = urlParts[0];
  const repo = urlParts[1];
  
  // Fetch README content from GitHub API
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/readme`,
    {
      headers: {
        Accept: 'application/vnd.github.raw',
        'User-Agent': 'Node.js',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch README content');
  }

  return await response.text();
}

export async function POST(request) {
  try {
    const { githubUrl } = await request.json();
    
    // Fetch README content
    const readmeContent = await fetchReadmeContent(githubUrl);
    
    // Get the summary using the chain
    const result = await createGitHubSummaryChain(readmeContent);
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}