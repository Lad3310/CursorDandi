import { supabase } from '@/supabaseClient';
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

export const runtime = 'edge';

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

async function summarizeReadme(readmeContent) {
  const model = new ChatOpenAI({ 
    temperature: 0.7,
    modelName: "gpt-3.5-turbo"
  });
  
  const prompt = PromptTemplate.fromTemplate(
    "Summarize this github repository from this readme file content:\n\n{readmeContent}"
  );
  
  const outputParser = StructuredOutputParser.fromNamesAndDescriptions({
    summary: "A concise summary of the GitHub repository",
    cool_facts: "A list of interesting facts about the repository"
  });
  
  const chain = RunnableSequence.from([
    prompt,
    model,
    outputParser,
  ]);
  
  return await chain.invoke({ readmeContent });
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

    // Get README content
    const readmeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    let readmeContent = null;
    if (readmeResponse.ok) {
      const readmeData = await readmeResponse.json();
      readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');
    }

    // Update API key usage count
    await supabase
      .from('api_keys')
      .update({ usage: (keyData.usage || 0) + 1 })
      .eq('id', keyData.id);

    let analysis = null;
    if (readmeContent) {
      analysis = await summarizeReadme(readmeContent);
    }

    return new Response(JSON.stringify({
      message: "GitHub repository summarization completed successfully",
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
      },
      readme: readmeContent,
      analysis
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