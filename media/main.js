const vscode = acquireVsCodeApi();

const codeArea = document.getElementById('codeArea');
const editButton = document.getElementById('editButton');

// Set the textarea as editable by default
let isEditable = false;
codeArea.readOnly = true;
editButton.innerHTML = '<i class="codicon codicon-edit"></i>';
editButton.title = 'Edit';

editButton.addEventListener('click', () => {
    isEditable = !isEditable;
    codeArea.readOnly = !isEditable;
    editButton.innerHTML = isEditable 
        ? '<i class="codicon codicon-save"></i>'
        : '<i class="codicon codicon-edit"></i>';
    editButton.title = isEditable ? 'Save' : 'Edit';
    
    if (isEditable) {
        codeArea.focus();
    } else {
        // Save the content
        vscode.postMessage({
            command: 'saveContent',
            text: codeArea.value
        });
    }
});

function share(platform) {
    vscode.postMessage({
        command: 'share',
        platform: platform,
        code: codeArea.value
    });
}

window.addEventListener('message', event => {
    const message = event.data;
    switch (message.command) {
        case 'updateCode':
            codeArea.value = message.code;
            break;
    }
});
