// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
var path = require("path");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "jsontodotnetenv" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('jsontodotnetenv.transform', function () {
		// The code you place here will be executed every time your command is executed
		transformJsonToENV();
		
		// Display a message box to the user
		// vscode.window.showInformationMessage('JsonToDotnetEnv');
	});

	context.subscriptions.push(disposable);
}

function transformJsonToENV() {
	var text = vscode.window.activeTextEditor.document.getText();
	var resultText = '';
	try {
		var json = JSON.parse(text);
		let result = readNode(json);
		result.forEach(ele => {
			resultText += `${ele.code}: "${ ele.name.toString().replace(/\\/g, "\\\\") }"\r\n`
		});
		
		vscode.window.activeTextEditor.edit(editBuilder => {
			let endLine = vscode.window.activeTextEditor.document.lineCount;
			editBuilder.replace(new vscode.Range(0,0,endLine,0), resultText);
		});
		
	} catch (error) {
		vscode.window.showErrorMessage(error.message);
	}
}

function readNode(jobject, parentNode = '') {
	let obj = {
		code: '',
		name: ''
	};
	let nKey = '';
	let result = [];

	for (let [key, value] of Object.entries(jobject)) {
		
		if (typeof(value) == "object" && !Array.isArray(value))
		{
			nKey = parentNode ? `${parentNode}__${key}` : key;
			result = result.concat(readNode(value, nKey));
		}
		else if (Array.isArray(value))
		{
			nKey = parentNode ? `${parentNode}__${key}` : key;
			result = result.concat(readArrayNode(value, nKey));
		}
		else {
			nKey = parentNode ? `${parentNode}__${key}` : key;
			obj = {
				code: nKey,
				name: value
			};
			result.push(obj);
		}		
	}

	return result;
}

function readArrayNode(jArray, parentNode = '') {
	let obj = {
		code: '',
		name: ''
	};
	let nKey = '';
	let result = [];
	for (let index = 0; index < jArray.length; index++) {
		const ele = jArray[index];
		if (typeof(ele) == "object" && !Array.isArray(ele))
		{
			nKey = parentNode ? `${parentNode}__${index}` : `${index}`;
			result = result.concat(readNode(ele, nKey));
		}
		else if (Array.isArray(ele))
		{
			nKey = parentNode ? `${parentNode}__${index}` : `${index}`;
			result = result.concat(readArrayNode(ele, nKey));
		}
		else {
			nKey = parentNode ? `${parentNode}__${index}` : `${index}`;
			obj = {
				code: nKey,
				name: ele
			};
			result.push(obj);
		}
	}
	return result;
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
