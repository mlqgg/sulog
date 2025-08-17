import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  // 转义正则表达式中的特殊字符
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  };

  // 读取配置
  const getConfiguration = () => {
    return vscode.workspace.getConfiguration('sulog');
  };

  // 显示配置信息
  const showConfigurationInfo = () => {
    const config = getConfiguration();
    const shortcut = config.get('consoleShortcut', 'cmd+shift+l');
    const prefix = config.get('consolePrefix', '【sulog】');
    const textColor = config.get('consoleTextColor', '#fff');
    const bgColor = config.get('consoleBackgroundColor', '#ff4e20');
    console.log(`Current Sulog configuration:`);
    console.log(`  consoleShortcut = ${shortcut}`);
    console.log(`  consolePrefix = ${prefix}`);
    console.log(`  consoleTextColor = ${textColor}`);
    console.log(`  consoleBackgroundColor = ${bgColor}`);
  };

  // 监听配置变化
  const configChangeListener = vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration('sulog')) {
      showConfigurationInfo();
      vscode.window.showInformationMessage('Sulog configuration updated. Please restart VS Code for keyboard shortcut changes to take effect.');
    }
  });

  // 初始显示配置
  showConfigurationInfo();

  context.subscriptions.push(configChangeListener);
  // 注册sayHello命令
  const helloCommand = 'sulog.sayHello';
  const helloCommandHandler = (name: string = 'world') => {
    console.log(`Hello ${name}!!!`);
  };
  context.subscriptions.push(vscode.commands.registerCommand(helloCommand, helloCommandHandler));

  // 注册removeConsoles命令
  const removeConsolesCommand = 'sulog.removeConsoles';
  const removeConsolesCommandHandler = async () => {
    // 获取当前工作区文件夹
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showErrorMessage('No workspace folder opened.');
      return;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    vscode.window.showInformationMessage(`Removing sulog consoles from ${rootPath}`);

    try {
      // 查找所有JavaScript和TypeScript文件
      const files = await vscode.workspace.findFiles('{**/*.js,**/*.ts,**/*.jsx,**/*.tsx}', '**/node_modules/**');
      let removedCount = 0;

      for (const file of files) {
        const document = await vscode.workspace.openTextDocument(file);
        const text = document.getText();

        // 获取配置中的prefix，用于识别sulog添加的console
        const config = getConfiguration();
        const prefix = config.get('consolePrefix', '【sulog】');

        // 构建正则表达式匹配sulog格式的console.log语句
        // 尝试更简单的匹配方式
        const prefixEscaped = escapeRegExp(prefix);

        // 调试信息
        console.log(`Trying to match sulog consoles with prefix: ${prefix}`);

        // 匹配带样式的prefix console
        const styledPattern = `console.log('%c${prefix}'`;
        // 匹配不带样式的prefix console
        const plainPattern = `console.log('${prefix}'`;

        // 简单字符串匹配和替换
        let newText = text;
        let styledCount = 0;
        let plainCount = 0;

        // 处理带样式的console
        let pos = newText.indexOf(styledPattern);
        while (pos !== -1) {
          // 查找行尾
          const endPos = newText.indexOf(');', pos);
          if (endPos !== -1) {
            newText = newText.substring(0, pos) + newText.substring(endPos + 2);
            styledCount++;
          } else {
            break;
          }
          pos = newText.indexOf(styledPattern);
        }

        // 处理不带样式的console
        pos = newText.indexOf(plainPattern);
        while (pos !== -1) {
          // 查找行尾
          const endPos = newText.indexOf(');', pos);
          if (endPos !== -1) {
            newText = newText.substring(0, pos) + newText.substring(endPos + 2);
            plainCount++;
          } else {
            break;
          }
          pos = newText.indexOf(plainPattern);
        }

        removedCount += styledCount + plainCount;
        console.log(`Removed ${styledCount} styled and ${plainCount} plain sulog consoles from ${file.fsPath}`);

        // 如果内容有变化，写回文件
        if (newText !== text) {
          const edit = new vscode.WorkspaceEdit();
          edit.replace(file, new vscode.Range(0, 0, document.lineCount, 0), newText);
          await vscode.workspace.applyEdit(edit);
          await document.save();
        }
      }

      vscode.window.showInformationMessage(`Successfully removed ${removedCount} sulog console statements.`);
    } catch (error) {
      vscode.window.showErrorMessage(`Error removing sulog consoles: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  context.subscriptions.push(vscode.commands.registerCommand(removeConsolesCommand, removeConsolesCommandHandler));

  // 注册insertConsole命令
  const consoleCommand = 'sulog.insertConsole';
  const consoleCommandHandler = () => {
    // 获取当前编辑的文本编辑器
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const selection = editor.selection;
    const cursorPosition = selection.active;
    const selectedText = document.getText(selection);

    // 获取配置
    const config = getConfiguration();
    const prefix = config.get('consolePrefix', '【sulog】');
    const textColor = config.get('consoleTextColor', '#fff');
    const bgColor = config.get('consoleBackgroundColor', '#ff4e20');

    // 构建样式字符串
    let styleStr = '';
    if (textColor) {
      styleStr += `color: ${textColor}; `;
    }
    if (bgColor) {
      styleStr += `background: ${bgColor};`;
    }

    // 构建console.log语句
    let consoleStatement = '';
    if (selectedText) {
      // 检查是否包含逗号分隔的多个变量
      const variables = selectedText.split(',').map(varName => varName.trim()).filter(Boolean);
      
      if (variables.length > 1) {
        // 多个变量，一行输出并保留prefix样式
        const enhancedStyle = `${styleStr} padding: 2px 6px; border-radius: 3px; font-weight: bold;`;
        let logParts = [`'%c${prefix}', '${enhancedStyle}'`];
        variables.forEach(varName => {
          logParts.push(`'${varName} = ', ${varName}`);
        });
        consoleStatement = `console.log(${logParts.join(', ')});`;
      } else {
        // 单个变量，保持原有逻辑
        const enhancedStyle = `${styleStr} padding: 2px 6px; border-radius: 3px; font-weight: bold;`;
        consoleStatement = `console.log('%c${prefix}', '${enhancedStyle}', '${selectedText}:', ${selectedText});`;
      }
    } else {
      if (styleStr) {
        consoleStatement = `console.log('%c${prefix}', '${styleStr}');`;
      } else {
        consoleStatement = `console.log('${prefix}');`;
      }
    }

    // 光标位置的下一行
    const line = cursorPosition.line + 1;
    const position = new vscode.Position(line, 0);

    // 插入console语句
    editor.edit(editBuilder => {
      editBuilder.insert(position, consoleStatement + '\n');
    });
  };
  context.subscriptions.push(vscode.commands.registerCommand(consoleCommand, consoleCommandHandler));
}


// This method is called when your extension is deactivated
export function deactivate() {}
