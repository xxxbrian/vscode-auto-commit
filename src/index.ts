import { defineExtension } from 'reactive-vscode'
import * as vscode from 'vscode'
import { generateCommitMessage, openSettings } from './commands'
import * as Meta from './generated/meta'

const { activate, deactivate } = defineExtension(() => {
  // Register commands
  const disposables: vscode.Disposable[] = []

  disposables.push(
    vscode.commands.registerCommand(Meta.commands.autoCommitGenerateCommitMessage, generateCommitMessage),
  )

  disposables.push(
    vscode.commands.registerCommand(Meta.commands.autoCommitOpenSettings, openSettings),
  )

  // Check if API key is configured
  const config = vscode.workspace.getConfiguration()
  const apiKey = config.get<string>(Meta.configs.autoCommitApiKey.key)
  const model = config.get<string>(Meta.configs.autoCommitModel.key)
  const baseURL = config.get<string>(Meta.configs.autoCommitBaseUrl.key)

  if (!apiKey || !model || !baseURL) {
    vscode.window.showWarningMessage(
      'Auto-commit not configured. Would you like to configure it now?',
      'Yes',
      'No',
    ).then((result) => {
      if (result === 'Yes') {
        vscode.commands.executeCommand(Meta.commands.autoCommitOpenSettings)
      }
    })
  }

  return {
    dispose: () => {
      disposables.forEach(d => d.dispose())
    },
  }
})

export { activate, deactivate }
