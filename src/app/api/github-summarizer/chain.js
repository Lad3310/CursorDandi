import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

export async function createGitHubSummaryChain(readmeContent) {
  const parser = StructuredOutputParser.fromNamesAndDescriptions({
    summary: "A concise summary of the GitHub repository",
    cool_facts: "A list of interesting facts about the repository"
  });
  
  const prompt = PromptTemplate.fromTemplate(`
    Analyze this GitHub repository README and provide a structured summary.
    Keep the summary concise (1-2 sentences) and extract 2-3 key interesting facts.
    
    README CONTENT:
    {readmeContent}
    
    {format_instructions}
    
    Return only the summary and cool_facts in the specified JSON format.
  `);
  
  const chain = RunnableSequence.from([
    {
      readmeContent: (input) => input.readmeContent,
      format_instructions: () => parser.getFormatInstructions(),
    },
    prompt,
    new ChatOpenAI({ 
      temperature: 0,
      modelName: "gpt-3.5-turbo"
    }),
    parser
  ]);
  
  return await chain.invoke({ readmeContent });
} 