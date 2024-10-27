import { NextResponse } from 'next/server';

export async function POST(request) {
  const { githubUrl } = await request.json();
  
  // Basic summary of the gpt-researcher project
  const summary = {
    name: "gpt-researcher",
    description: "An autonomous agent designed for comprehensive web and local research on any given task.",
    key_features: [
      "Produces detailed, factual, and unbiased research reports",
      "Addresses issues of misinformation, speed, determinism, and reliability",
      "Utilizes multiple AI agents for improved research depth and quality",
      "Supports both web sources and local document research",
      "Generates long and detailed research reports (over 2K words)",
      "Aggregates over 20 web sources per research",
      "Includes lightweight and production-ready UI options",
    ],
    technologies: ["Python", "FastAPI", "NextJS", "Tailwind CSS", "Docker"],
    github_url: "https://github.com/Lad3310/gpt-researcher"
  };
  
  return NextResponse.json({ 
    message: `Received URL: ${githubUrl}`,
    summary: summary
  });
}
