# Sulog VS Code Extension

A super quick way to insert console.log statements in your code.

## Features

1. Insert console.log statements quickly with a keyboard shortcut
2. Automatically includes selected text in the console.log statement
3. Customizable keyboard shortcut
4. Customizable prefix for console.log statements
5. Customizable text color and background color for console output

## Usage

1. Select any text in your editor
2. Press `cmd+shift+l` (Mac) to insert a console.log statement with the selected text
3. If no text is selected, a basic `console.log();` statement will be inserted
4. The console.log statement is always inserted on the line below the cursor

## Requirements

None

## Extension Settings

This extension contributes the following settings:

* `sulog.consoleShortcut`: Custom shortcut for inserting console.log statements (default: `cmd+shift+l`)
* `sulog.consolePrefix`: Custom prefix for console.log statements (default: `prefix>>>`)
* `sulog.consoleTextColor`: Custom text color for console.log statements (CSS color value, default: empty)
* `sulog.consoleBackgroundColor`: Custom background color for console.log statements (CSS color value, default: empty)

## Customization

You can customize various aspects of the extension by following these steps:

### Keyboard Shortcut

1. Open VS Code settings (Code > Preferences > Settings)
2. Search for "Sulog Configuration"
3. Change the "Console Shortcut" value to your desired keyboard shortcut
4. Restart VS Code for the changes to take effect

### Prefix

1. Open VS Code settings (Code > Preferences > Settings)
2. Search for "Sulog Configuration"
3. Change the "Console Prefix" value to your desired prefix

### Text Color

1. Open VS Code settings (Code > Preferences > Settings)
2. Search for "Sulog Configuration"
3. Change the "Console Text Color" value to your desired CSS color value (e.g., `red`, `#ff0000`, `rgb(255, 0, 0)`)

### Background Color

1. Open VS Code settings (Code > Preferences > Settings)
2. Search for "Sulog Configuration"
3. Change the "Console Background Color" value to your desired CSS color value (e.g., `yellow`, `#ffff00`, `rgb(255, 255, 0)`)

Alternatively, you can edit the `keybindings.json` file directly:

1. Open the Command Palette (`cmd+shift+p`)
2. Search for "Preferences: Open Keyboard Shortcuts (JSON)"
3. Add or modify the keybinding for `sulog.insertConsole`

Example keybindings.json entry:
```json
[
  {
    "key": "ctrl+shift+l",
    "command": "sulog.insertConsole",
    "when": "editorTextFocus"
  }
]
```

## Known Issues

* Keyboard shortcut changes require a restart of VS Code to take effect

## Release Notes

### 0.0.1
Initial release of Sulog
- Basic console.log insertion
- Customizable keyboard shortcut

### 0.0.2
Added new features:
- Customizable prefix for console.log statements
- Customizable text color for console output
- Customizable background color for console output

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
