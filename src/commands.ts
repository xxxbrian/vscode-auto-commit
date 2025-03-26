import * as vscode from 'vscode'
import { getDiffStaged } from './git'
import { getCommitPrompt } from './prompt'
import { generateWithProvider } from './provider'

// Returns the Git repository for the current workspace.
async function getRepo(): Promise<any> {
  const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports
  const gitApi = gitExtension?.getAPI(1)

  if (!gitApi) {
    throw new Error('Git extension not found')
  }

  if (gitApi.repositories.length === 0) {
    throw new Error('No Git repositories found')
  }

  return gitApi.repositories[0]
}

// Returns the commit message based on staged changes.
export async function generateCommitMessage() {
  try {
    // Show progress notification
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Generating commit message...',
        cancellable: false,
      },
      async (progress) => {
        // Get the Git repository
        progress.report({ message: 'Getting repository...' })
        const repo = await getRepo()

        // Get staged changes
        progress.report({ message: 'Getting staged changes...' })
        const { diff, error } = await getDiffStaged(repo)

        if (error) {
          throw new Error(`Failed to get staged changes: ${error}`)
        }

        if (!diff || diff === 'No changes staged.') {
          throw new Error('No changes staged for commit')
        }

        // Get the current commit message (if any)
        const scmInputBox = repo.inputBox
        if (!scmInputBox) {
          throw new Error('Unable to find the SCM input box')
        }

        // Generate commit message
        progress.report({ message: 'Analyzing changes...' })
        const messages = getCommitPrompt()
        messages.push({ role: 'user', content: diff })

        progress.report({ message: 'Generating commit message...' })
        const commitMessage = await generateWithProvider(messages as Array<{ role: 'system' | 'user' | 'assistant', content: string }>)

        if (commitMessage) {
          scmInputBox.value = commitMessage
        }
        else {
          throw new Error('Failed to generate commit message')
        }
      },
    )
  }
  catch (error: any) {
    vscode.window.showErrorMessage(`Auto-commit error: ${error.message}`)
  }
}

// Opens the extension settings.
export function openSettings() {
  vscode.commands.executeCommand('workbench.action.openSettings', 'auto-commit')
}
