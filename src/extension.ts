import * as vscode from 'vscode';
import { CodeShareProvider } from './CodeShareProvider';

let provider: CodeShareProvider;

function updateSelectedCode(event: vscode.TextEditorSelectionChangeEvent) {
    console.log('Selection changed');
    const editor = event.textEditor;
    const selection = editor.selection;
    
    if (!selection.isEmpty) {
        const text = editor.document.getText(selection);
        console.log('Selected text:', text);
        provider.updateContent(text);
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Code Share extension is being activated');
    provider = new CodeShareProvider(context.extensionUri);
    
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('codeShareSidebar', provider)
    );

    // Listen for selection changes
    context.subscriptions.push(
        vscode.window.onDidChangeTextEditorSelection(updateSelectedCode)
    );

    // Register sharing commands
    context.subscriptions.push(vscode.commands.registerCommand('extension.shareCodeWhatsApp', () => shareCodePlatform('whatsapp')));
    context.subscriptions.push(vscode.commands.registerCommand('extension.shareCodeEmail', () => shareCodePlatform('email')));
    context.subscriptions.push(vscode.commands.registerCommand('extension.shareCodeDiscord', () => shareCodePlatform('discord')));
    context.subscriptions.push(vscode.commands.registerCommand('extension.shareCodeSlack', () => shareCodePlatform('slack')));
    context.subscriptions.push(vscode.commands.registerCommand('extension.shareCodeTeams', () => shareCodePlatform('teams')));
}

function shareCode() {
    console.log('shareCode function called');
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor!');
        return;
    }

    const selection = editor.selection;
    const text = selection.isEmpty ? editor.document.getText() : editor.document.getText(selection);

    provider.updateContent(text);

    vscode.commands.executeCommand('workbench.view.extension.code-share-sidebar-view');
}

async function shareCodePlatform(platform: string) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor!');
        return;
    }

    const selection = editor.selection;
    const text = selection.isEmpty ? editor.document.getText() : editor.document.getText(selection);

    await vscode.env.clipboard.writeText(text);

    let url: vscode.Uri;
    let message: string = '';

    switch (platform) {
        case 'whatsapp':
            if (await vscode.env.asExternalUri(vscode.Uri.parse('whatsapp'))) {
                url = vscode.Uri.parse(`whatsapp://send?text=${encodeURIComponent(text)}`);
                message = 'Sending message via WhatsApp...';
            } else {
                url = vscode.Uri.parse('https://web.whatsapp.com/send?text=' + encodeURIComponent(text));
                message = 'Open WhatsApp Web to paste and send the message.';
            }
            break;

        case 'email':
            url = vscode.Uri.parse(`mailto:?subject=Code%20Snippet&body=${encodeURIComponent(text)}`);
            message = 'Opening your email client to send the message...';
            break;

        case 'discord':
            if (await vscode.env.asExternalUri(vscode.Uri.parse('discord'))) {
                url = vscode.Uri.parse('discord://send?text=' + encodeURIComponent(text));
            } else {
                url = vscode.Uri.parse('https://discord.com/app');
                message = 'Open Discord Web to paste and send the message.';
            }
            break;

        case 'slack':
            if (await vscode.env.asExternalUri(vscode.Uri.parse('slack'))) {
                url = vscode.Uri.parse('slack://send?text=' + encodeURIComponent(text));
                message = 'Open Slack to paste and send the message.';
            } else {
                url = vscode.Uri.parse('https://slack.com/');
                message = 'Open Slack Web to paste and send the message.';
            }
            break;

        case 'teams':
            url = vscode.Uri.parse('https://teams.microsoft.com');
            message = 'Open Microsoft Teams to paste and send the message.';
            break;

        default:
            vscode.window.showInformationMessage('Code copied to clipboard.');
            return;
    }

    vscode.window.showInformationMessage(message);
    await vscode.env.openExternal(url);
}

export function deactivate() {}
