import { existsSync, writeFile } from "fs";
import { dirname } from "path";

let actionInputs = {
    "nuget-package-name": "add package name here",
	"version": "add version here",
	"check-nuget": "true or false string here",
	"fail-if-nuget-version-exists": "true or false string here",
};

let cwd = process.cwd();
let filePath = `${cwd}\\env.json`;

if (!existsSync(filePath)) {
    let actionInputsJSON = JSON.stringify(actionInputs);
    
    actionInputsJSON = addNewLine(actionInputsJSON, "nuget-package-name", 1);
    actionInputsJSON = addNewTab(actionInputsJSON, "nuget-package-name", 1);

    actionInputsJSON = addNewLine(actionInputsJSON, "version", 1);
    actionInputsJSON = addNewTab(actionInputsJSON, "version", 1);

    actionInputsJSON = addNewLine(actionInputsJSON, "check-nuget", 1);
    actionInputsJSON = addNewTab(actionInputsJSON, "check-nuget", 1);

    actionInputsJSON = addNewLine(actionInputsJSON, "fail-if-nuget-version-exists", 1);
    actionInputsJSON = addNewTab(actionInputsJSON, "fail-if-nuget-version-exists", 1);

    // Move the ending curly brace to the next line
    actionInputsJSON = actionInputsJSON.replace("}", "\n}");

    // Add some space after each JSON key colon identifier
    actionInputsJSON = replaceAllText(actionInputsJSON, "\":\"", "\": \"");

    writeFile(filePath, actionInputsJSON, (error) => {
        if (error) {
            console.log(error.message);
        }
    });

    console.log(`\nNew environment JSON file with the name 'env.json' created at directory '${dirname(filePath)}\\'\n`);
} else {
    console.log("The file 'env.json' already exists.");
}

/**
 * Adds new lines to the given JSON key in the given JSON text.
 * @param { string } jsonText Stuff
 * @param { string } jsonKey The JSON key to add the new lines to
 * @param { number } totalLines The total number of lines to add.
 * @returns { string } The new JSON text with the modified JSON key.
 */
function addNewLine (jsonText, jsonKey, totalLines) {
    if (!jsonText.includes(jsonKey)) {
        throw new Error(`The JSON key '${jsonKey}' was not found in the action inputs JSON.`);
    }

    let newJSONKey = "";
    
    for (let i = 0; i < totalLines; i++) {
        newJSONKey += "\n";
    }
    
    newJSONKey += `\"${jsonKey}\"`;
    
    jsonKey = `\"${jsonKey}\"`;

    jsonText = jsonText.replace(jsonKey, newJSONKey);

    return jsonText;
}

/**
 * Adds new tabs to the given JSON key in the given JSON text.
 * @param { string } jsonText Stuff
 * @param { string } jsonKey The JSON key to add the new lines to
 * @param { number } totalTabs The total number of lines to add.
 * @returns { string } The new JSON text with the modified JSON key.
 */
 function addNewTab (jsonText, jsonKey, totalTabs) {
    if (!jsonText.includes(jsonKey)) {
        throw new Error(`The JSON key '${jsonKey}' was not found in the action inputs JSON.`);
    }

    let newJSONKey = "";
    
    for (let i = 0; i < totalTabs; i++) {
        newJSONKey += "\t";
    }
    
    newJSONKey += `\"${jsonKey}\"`;
    
    jsonKey = `\"${jsonKey}\"`;

    jsonText = jsonText.replace(jsonKey, newJSONKey);

    return jsonText;
}

/**
 * Searches for the given search value in the given text and replaces
 * all instances of it with the given replace value.
 * @param { string } text The text to search in.
 * @param { string } searchValue The text to to replaced.
 * @param { string } replaceValue The value to replace the found text with.
 * @returns { string } The original text with all search values replaced.
 */
function replaceAllText(text, searchValue, replaceValue) {
    while (text.includes(searchValue)) {
        text = text.replace(searchValue, replaceValue);
    }

    return text;
}