import * as vscode from 'vscode'
import * as Meta from './generated/meta'

// Returns the prompt messages array.
export function getCommitPrompt(): Array<{ role: 'system' | 'user' | 'assistant', content: string }> {
  const config = vscode.workspace.getConfiguration()
  const customPrompt = config.get<string>(Meta.configs.autoCommitPrompt.key)

  const systemPrompt = customPrompt || `Analyze a git diff and make a short conventional commit message, follow this template:
[TYPE(SCOPE)]: [MESSAGE]
Where:
  - feat: A new feature
  - fix: A bug fix
  - docs: Documentation only changes
  - style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
  - refactor: A code change that neither fixes a bug nor adds a feature
  - perf: A code change that improves performance
  - test: Adding missing tests or correcting existing tests
  - build: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
  - ci: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
  - chore: Other changes that dont modify src or test files
Response example:
  - chore(dependencies): bump terser to 5.16.6
  - feat(auth): add support for multi-factor authentication
  - docs(api): update API documentation with new endpoints
  - refactor(auth): simplify token validation logic
  - test(notifications): add unit tests for email notifications
  - build(docker): update Dockerfile to use Alpine base image
  - ci(github-actions): add a workflow to automate release creation
  - fix(cart): correct discount calculation for multiple items
  - refactor(modal): extract common modal logic to a utility function
  - perf(database): optimize query performance for large datasets
  - chore(dependencies): remove unused lodash dependency`

  return [
    {
      role: 'system',
      content: systemPrompt,
    },
  ]
}
