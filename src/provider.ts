import OpenAI from 'openai'
import * as vscode from 'vscode'
import * as Meta from './generated/meta'

// Returns the provider configuration object.
function getProviderConfig() {
  const config = vscode.workspace.getConfiguration()
  const apiKey = config.get<string>(Meta.configs.autoCommitApiKey.key)
  const baseUrl = config.get<string>(Meta.configs.autoCommitBaseUrl.key)

  if (!apiKey) {
    throw new Error('The API key is missing or empty.')
  }

  const openAIConfig: {
    apiKey: string
    baseURL?: string
  } = {
    apiKey,
  }

  if (baseUrl) {
    openAIConfig.baseURL = baseUrl
  }

  return openAIConfig
}

// Returns the provider API instance.
export function createProviderApi() {
  const config = getProviderConfig()
  return new OpenAI(config)
}

// Sends a chat completion request to the provider API.
export async function generateWithProvider(messages: Array<{ role: 'system' | 'user' | 'assistant', content: string }>) {
  const provider = createProviderApi()
  const config = vscode.workspace.getConfiguration()
  const model = config.get<string>(Meta.configs.autoCommitModel.key)!

  try {
    const completion = await provider.chat.completions.create({
      model,
      messages: messages as any,
      temperature: 0.7,
    })

    return completion.choices[0]?.message?.content || ''
  }
  catch (error: any) {
    console.error('Provider API error:', error)
    throw new Error(`Provider API error: ${error.message}`)
  }
}
