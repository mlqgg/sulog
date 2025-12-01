# Change Log

All notable changes to the "sulog" extension will be documented in this file.

## 0.1.0 - 2025-11-29
Features & Improvements:
- Console 插入格式升级：两段 `%c` 样式（前缀与标签），并采用多行，避免语句过长。
- 新配置项：`sulog.consoleFontSize`、`sulog.consoleFontWeight`，控制第二段样式的字体大小与粗细。
- 多变量合并：新增 `sulog.mergeMultiVariables`（默认 `true`），选择多个变量时合并为一条语句。
- 默认前缀由 `【sulog】` 改为 `sulog`（可通过 `sulog.consolePrefix` 自定义）。
- 删除命令增强：仅删除由 sulog 生成的日志，兼容单/多行与新旧样式；行为限定为“当前文件”。
- 激活事件补充：加入 `onCommand:sulog.removeConsoles`，确保删除命令可触发。

## 0.0.1 - 2024-01-01
Initial release:
- Basic console.log insertion
- Customizable keyboard shortcut
## 0.1.1 - 2025-12-01
Fixes & UX:
- 删除正则调整：移除日志时保留下一行缩进，清理尾部空行，不破坏正常内容空格。
- 插入对齐：按上一行缩进对齐生成的多行 console 语句。
- 插入后定位：光标自动移动到插入语句末尾并居中显示。
