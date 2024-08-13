import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const command = 'sulog.sayHello';

  const commandHandler = (name: string = 'world') => {
    console.log(`Hello ${name}!!!`);
  };

  context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler));
}


// This method is called when your extension is deactivated
export function deactivate() {}
