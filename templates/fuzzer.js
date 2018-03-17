var fs = require('fs');
var shell = require('shelljs');
var _ = require('underscore');

function getSourceFilePaths()
{
    var pathPrefix = '../iTrust2-v1/iTrust2/src/main/java/edu/ncsu/csc/itrust2/';

    var directories =
    [
        'config',
        'controllers',
        'controllers/admin',
        'controllers/api',
        'controllers/hcp',
        'controllers/patient',
        'controllers/personnel',
        'forms',
        'forms/admin',
        'forms/hcp',
        'forms/hcp_patient',
        'forms/patient',
        'forms/personnel',
        'models/enums',
        'models/persistent',
        'mvc/config',
        'utils'
    ];

    var candidateFiles = [];

    for (i = 0; i < directories.length; i++)
    {
        var files = fs.readdirSync(pathPrefix + directories[i]);
    
        for (j = 0; j < files.length; j++)
        {
            if (files[j].endsWith('.java'))
            {
                candidateFiles.push(pathPrefix + directories[i] + '/' + files[j]);
            }
        }
    }
    return candidateFiles;
}

function mutateStrings(fileContent)
{
    var alteredFileContent = fileContent;

    // Generate a random string

    var randomString = '"';

    for (i = 0; i < 10; i++)
    {
        var charCode = Math.floor(Math.random() * 95) + 32;
        randomString += String.fromCharCode(charCode);
    }

    randomString += '"';

    // Replace all substrings between quotation marks with random string

    var stringPattern = RegExp('"[^"]+"', 'g');

    alteredFileContent = alteredFileContent.replace(stringPattern, randomString);
    
    return alteredFileContent;
}

function swapGtLt(fileContent)
{
    var alteredFileContent = fileContent;

    // Find indices of all > characters

    var gtMatch;
    var gtIndices = [];
    var gtPattern = RegExp('>', 'g');

    while ((gtMatch = gtPattern.exec(fileContent)) !== null)
    {
        gtIndices.push(gtPattern.lastIndex - 1);
    }

    // Find indices of all < characters

    var ltMatch;
    var ltIndices = [];
    var ltPattern = RegExp('<', 'g');

    while ((ltMatch = ltPattern.exec(fileContent)) !== null)
    {
        ltIndices.push(ltPattern.lastIndex - 1);
    }

    // Change all > characters to <

    for (i = 0; i < gtIndices.length; i++)
    {
        alteredFileContent = alteredFileContent.substr(0, gtIndices[i]) + '<' + alteredFileContent.substr(gtIndices[i] + 1);
    }

    // Change all < characters to >

    for (i = 0; i < ltIndices.length; i++)
    {
        alteredFileContent = alteredFileContent.substr(0, ltIndices[i]) + '>' + alteredFileContent.substr(ltIndices[i] + 1);
    }

    return alteredFileContent;
}

function swapEqNeq(fileContent)
{
    var alteredFileContent = fileContent;

    // Find indices of all == substrings

    var eqMatch;
    var eqIndices = [];
    var eqPattern = RegExp('==', 'g');

    while ((eqMatch = eqPattern.exec(fileContent)) !== null)
    {
        eqIndices.push(eqPattern.lastIndex - 2);
    }

    // Find indices of all != substrings

    var neqMatch;
    var neqIndices = [];
    var neqPattern = RegExp('!=', 'g');

    while ((neqMatch = neqPattern.exec(fileContent)) !== null)
    {
        neqIndices.push(neqPattern.lastIndex - 2);
    }

    // Change all == substrings to !=

    for (i = 0; i < eqIndices.length; i++)
    {
        alteredFileContent = alteredFileContent.substr(0, eqIndices[i]) + '!' + alteredFileContent.substr(eqIndices[i] + 1);
    }

    // Change all != substrings to ==

    for (i = 0; i < neqIndices.length; i++)
    {
        alteredFileContent = alteredFileContent.substr(0, neqIndices[i]) + '=' + alteredFileContent.substr(neqIndices[i] + 1);
    }

    return alteredFileContent;
}

function swapZeroOne(fileContent)
{
    var alteredFileContent = fileContent;

    // Find indices of all 0 characters

    var zeroMatch;
    var zeroIndices = [];
    var zeroPattern = RegExp('0', 'g');

    while ((zeroMatch = zeroPattern.exec(fileContent)) !== null)
    {
        zeroIndices.push(zeroPattern.lastIndex - 1);
    }

    // Find indices of all 1 characters

    var oneMatch;
    var oneIndices = [];
    var onePattern = RegExp('1', 'g');

    while ((oneMatch = onePattern.exec(fileContent)) !== null)
    {
        oneIndices.push(onePattern.lastIndex - 1);
    }

    // Change all 0 characters to 1

    for (i = 0; i < zeroIndices.length; i++)
    {
        alteredFileContent = alteredFileContent.substr(0, zeroIndices[i]) + '1' + alteredFileContent.substr(zeroIndices[i] + 1);
    }

    // Change all 1 characters to 0

    for (i = 0; i < oneIndices.length; i++)
    {
        alteredFileContent = alteredFileContent.substr(0, oneIndices[i]) + '0' + alteredFileContent.substr(oneIndices[i] + 1);
    }

    return alteredFileContent;
}

var allFiles = getSourceFilePaths();

var compilationFailure = true;

while (compilationFailure)
{
    console.log('\nFuzzing files...\n');

    var selectedFiles = [];

    while (selectedFiles.length < 10)
    {
        var file = allFiles[Math.floor(Math.random() * 86)];
        if(!_.contains(selectedFiles, file)) selectedFiles.push(file);
    }

    for (n = 0; n < selectedFiles.length; n++)
    {
        var fuzzingOperation = Math.floor(Math.random() * 4);

        var content = String(fs.readFileSync(selectedFiles[n]));

        if (fuzzingOperation === 0)
        {
            console.log((n+1) + '.\tChanging strings\t' + selectedFiles[n]);
            var fuzzedContent = mutateStrings(content);
            fs.writeFileSync(selectedFiles[n], fuzzedContent);
        }
        else if (fuzzingOperation === 1)
        {
            console.log((n+1) + '.\tSwapping > with <\t' + selectedFiles[n]);
            var fuzzedContent = swapGtLt(content);
            fs.writeFileSync(selectedFiles[n], fuzzedContent);
        }
        else if (fuzzingOperation === 2)
        {
            console.log((n+1) + '.\tSwapping == with !=\t' + selectedFiles[n]);
            var fuzzedContent = swapEqNeq(content);
            fs.writeFileSync(selectedFiles[n], fuzzedContent);
        }
        else if (fuzzingOperation === 3)
        {
            console.log((n+1) + '.\tSwapping 0 and 1\t' + selectedFiles[n]);
            var fuzzedContent = swapZeroOne(content);
            fs.writeFileSync(selectedFiles[n], fuzzedContent);
        }
    }

    console.log('\nTesting compilaiton...\n');

    if (shell.exec('cd ../iTrust2-v1/iTrust2 && sudo mvn compile').code === 0) compilationFailure = false;
    else shell.exec('cd ../iTrust2-v1 && git checkout -- .');

    console.log();
}