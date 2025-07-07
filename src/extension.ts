import * as vscode from 'vscode';

let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel('Systemd Unit File');
    outputChannel.appendLine('Systemd Unit File extension activated.');

    const applySystemdUnitFileLanguage = async (document: vscode.TextDocument) => {
        if (document.uri.scheme !== 'file') {
            return;
        }

        const config = vscode.workspace.getConfiguration('systemd-unit-file');
        const enabledExtensions = config.get<string[]>('enabledExtensions', []);

        const fileName = document.fileName;
        const fileExtension = fileName.substring(fileName.lastIndexOf('.'));

        outputChannel.appendLine(`Checking file: ${fileName}, languageId: ${document.languageId}`);
        if (enabledExtensions.includes(fileExtension) && document.languageId !== 'systemd-unit-file') {
            try {
                await vscode.languages.setTextDocumentLanguage(document, 'systemd-unit-file');
                outputChannel.appendLine(`Applied language for ${fileName} to systemd-unit-file`);
            } catch (error) {
                outputChannel.appendLine(`Failed to set language for ${fileName}: ${error}`);
            }
        }
    };

    // 既存のドキュメントをチェック
    vscode.workspace.textDocuments.forEach(doc => {
        applySystemdUnitFileLanguage(doc);
    });

    // 新しく開かれたドキュメントを監視
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(applySystemdUnitFileLanguage)
    );

    // 設定が変更されたときの処理
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(async (e) => {
            if (e.affectsConfiguration('systemd-unit-file.enabledExtensions')) {
                outputChannel.appendLine('Configuration changed, reapplying language to all documents.');
                // すべてのドキュメントに対して言語を再適用
                vscode.workspace.textDocuments.forEach(doc => {
                    applySystemdUnitFileLanguage(doc);
                });
            }
        }
    ));

    // 初期化時にアクティブエディタをチェック
    if (vscode.window.activeTextEditor) {
        applySystemdUnitFileLanguage(vscode.window.activeTextEditor.document);
    }
}

export function deactivate() {
    if (outputChannel) {
        outputChannel.appendLine('Systemd Unit File extension deactivated.');
        outputChannel.dispose();
    }
}
