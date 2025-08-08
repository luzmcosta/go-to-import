# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a VS Code extension project. Please use the get_vscode_api with a query as input to fetch the latest VS Code API references.

## Project Description

This VS Code extension allows users to jump to files by clicking on import statement file names. It uses DocumentLinkProvider to detect and make import statements clickable.

## Key Features

- Detects import statements in JavaScript, TypeScript, Python, and other languages
- Makes file paths in import statements clickable
- Jumps to the target file when clicked
- Supports relative and absolute paths

## Architecture

- Uses VS Code's DocumentLinkProvider API
- Registers link providers for relevant language selectors
- Parses import statements using regex patterns
- Resolves file paths relative to the current document
