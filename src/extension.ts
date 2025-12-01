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
    const prefix = config.get('consolePrefix', 'sulog');
    const textColor = config.get('consoleTextColor', '#fff');
    const bgColor = config.get('consoleBackgroundColor', '#ff4e20');
    const fontSize = config.get('consoleFontSize', '14px');
    const fontWeight = config.get('consoleFontWeight', 'bold');
    const mergeMultiVariables = config.get('mergeMultiVariables', true);
    console.log(`Current Sulog configuration:`);
    console.log(`  consoleShortcut = ${shortcut}`);
    console.log(`  consolePrefix = ${prefix}`);
    console.log(`  consoleTextColor = ${textColor}`);
    console.log(`  consoleBackgroundColor = ${bgColor}`);
    console.log(`  consoleFontSize = ${fontSize}`);
    console.log(`  consoleFontWeight = ${fontWeight}`);
    console.log(`  mergeMultiVariables = ${mergeMultiVariables}`);
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
    // 仅处理当前活动编辑器中的文件
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor. Open a file to remove sulog consoles.');
      return;
    }

    const document = editor.document;
    const filePath = document.uri.fsPath;
    vscode.window.showInformationMessage(`Removing sulog consoles from current file: ${filePath}`);
    try {
      const text = document.getText();

      // 获取配置中的prefix，用于识别sulog添加的console
      const config = getConfiguration();
      const prefix = config.get('consolePrefix', 'sulog');
      const prefixEscaped = escapeRegExp(prefix);

      // 调试信息
      console.log(`Trying to match sulog consoles with prefix: ${prefix}`);

      // 使用正则匹配并移除整段 console.log(...)（支持多行），同时移除行首缩进与尾部换行，避免空行残留
      // - 样式日志：第一个字符串参数以 %c + prefix 开头
      // - 普通日志：第一个字符串参数为 prefix
      const styledRegex = new RegExp(
        `(^|\\r?\\n)[\\t ]*console\\.log\\(\\s*['"]\\s*%c\\s*${prefixEscaped}[\\s\\S]*?\\);[\\t ]*(?:\\r?\\n)?`,
        'gm'
      );
      const plainRegex = new RegExp(
        `(^|\\r?\\n)[\\t ]*console\\.log\\(\\s*['"]\\s*${prefixEscaped}[\\s\\S]*?\\);[\\t ]*(?:\\r?\\n)?`,
        'gm'
      );

      let newText = text;
      const styledMatches = (newText.match(styledRegex) || []).length;
      newText = newText.replace(styledRegex, '$1');
      const plainMatches = (newText.match(plainRegex) || []).length;
      newText = newText.replace(plainRegex, '$1');

      const removedCount = styledMatches + plainMatches;
      console.log(`Removed ${styledMatches} styled and ${plainMatches} plain sulog consoles from ${filePath}`);

      if (newText !== text) {
        const fullRange = new vscode.Range(new vscode.Position(0, 0), document.lineAt(document.lineCount - 1).range.end);
        const edit = new vscode.WorkspaceEdit();
        edit.replace(document.uri, fullRange, newText);
        await vscode.workspace.applyEdit(edit);
        await document.save();
      }

      vscode.window.showInformationMessage(`Successfully removed ${removedCount} sulog console statements from current file.`);
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
    const prefix = config.get('consolePrefix', 'sulog');
    const textColor = config.get('consoleTextColor', '#fff');
    const bgColor = config.get('consoleBackgroundColor', '#ff4e20');
    const fontSize = config.get('consoleFontSize', '14px');
    const fontWeight = config.get('consoleFontWeight', 'bold');
    const mergeMultiVariables = config.get('mergeMultiVariables', true);

    // 第一段样式（前缀样式）：color + background
    let prefixStyle = '';
    if (textColor) {
      prefixStyle += `color: ${textColor};`;
    }
    if (bgColor) {
      prefixStyle += (prefixStyle ? ' ' : '') + `background: ${bgColor};`;
    }

    // 第二段样式（标签样式）：从配置读取字体大小与粗细
    const labelStyle = `font-size: ${fontSize}; font-weight: ${fontWeight};`;

    // 构建console.log语句（多行格式，避免过长）
    let consoleStatement = '';
    const buildMultiline = (label: string, valueExpr: string) => {
      if (prefixStyle) {
        return [
          'console.log(',
          `  '%c ${prefix} %c ${label}:',`,
          `  '${prefixStyle}',`,
          `  '${labelStyle}',`,
          `  ${valueExpr},`,
          ');'
        ].join('\n');
      }
      // 无样式时，简化为无 %c 的多行
      return [
        'console.log(',
        `  '${prefix} ${label}:',`,
        `  ${valueExpr},`,
        ');'
      ].join('\n');
    };

    if (selectedText) {
      const variables = selectedText.split(',').map(v => v.trim()).filter(Boolean);
      if (variables.length > 1) {
        if (mergeMultiVariables) {
          const label = variables.join(', ');
          const valueExpr = `{ ${variables.join(', ')} }`;
          consoleStatement = buildMultiline(label, valueExpr);
        } else {
          const blocks = variables.map(varName => buildMultiline(varName, varName));
          consoleStatement = blocks.join('\n');
        }
      } else {
        const varName = variables[0];
        consoleStatement = buildMultiline(varName, varName);
      }
    } else {
      // 无选择内容，仅输出前缀（第一段样式）
      if (prefixStyle) {
        consoleStatement = [
          'console.log(',
          `  '%c ${prefix}',`,
          `  '${prefixStyle}',`,
          ');'
        ].join('\n');
      } else {
        consoleStatement = [
          'console.log(',
          `  '${prefix}',`,
          ');'
        ].join('\n');
      }
    }

    // 光标位置的下一行
    const line = cursorPosition.line + 1;
    const position = new vscode.Position(line, 0);

    // 读取上一行缩进，保持插入内容对齐
    const currentLine = document.lineAt(cursorPosition.line);
    const indent = currentLine.text.slice(0, currentLine.firstNonWhitespaceCharacterIndex);
    const indentedConsoleStatement = consoleStatement
      .split('\n')
      .map(l => indent + l)
      .join('\n');

    // 插入console语句
    editor.edit(editBuilder => {
      editBuilder.insert(position, indentedConsoleStatement + '\n');
    }).then((applied) => {
      if (applied) {
        const insertedLines = indentedConsoleStatement.split('\n');
        const lastLineText = insertedLines[insertedLines.length - 1];
        const endPos = new vscode.Position(line + insertedLines.length - 1, lastLineText.length);
        editor.selection = new vscode.Selection(endPos, endPos);
        editor.revealRange(new vscode.Range(endPos, endPos), vscode.TextEditorRevealType.InCenter);
      }
    });
  };
  context.subscriptions.push(vscode.commands.registerCommand(consoleCommand, consoleCommandHandler));
}


// This method is called when your extension is deactivated
export function deactivate() {}
