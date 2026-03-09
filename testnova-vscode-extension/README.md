# TestNova VS Code Extension

Generate unit tests and test cases directly from VS Code using the TestNova API flow used by the web app.

Application URL: `https://testnovatool.vercel.app`

## Features

- Generate tests for a whole file by right-clicking in Explorer:
  `TestNova: Generate Unit Tests`
- Generate tests for selected code in editor:
  `TestNova: Generate Tests from Selection`
- Progress notifications while requests run.
- Opens generated tests in a new editor tab.
- Error notifications when API requests fail.

## API Used

Primary:
- `POST https://testnovatool.vercel.app/api/chat`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "conversationId": "...", "prompt": "..." }`

Fallback:
- `POST https://testnovatool.vercel.app/api/prompts`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "prompt": "..." }`

The extension builds a test-generation prompt from your file/selection and sends it through this backend flow.

```json
{
  "code": "<file content or selected code>"
}
```

## Project Structure

```text
testnova-vscode-extension
  |-- package.json
  |-- extension.js
  |-- README.md
  `-- src
      |-- commands
      |   |-- generateTests.js
      |   `-- generateFromSelection.js
      |-- api
      |   `-- testnovaApi.js
      `-- utils
          `-- getSelectedCode.js
```

## Run the Extension (F5)

1. Open folder `testnova-vscode-extension` in VS Code.
2. Install dependencies:

```bash
npm install
```

3. Press `F5` to start Extension Development Host.
4. In the new VS Code window, set auth token once:
- `Ctrl+Shift+P` -> `TestNova: Set Auth Token`
5. Generate tests:
- Right click a file in Explorer and choose `TestNova` -> `Generate Unit Tests`.
- Or select code in editor, right click and choose `TestNova` -> `Generate Tests from Selection`.
