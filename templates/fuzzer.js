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
    var lines = fileContent.split('\n');

    var alteredFileContent = '';

    for (y = 0; y < lines.length; y++)
    {
        if (lines[y].match(/".*\/.*"/g) !== null || lines[y].includes('while') || lines[y].includes('@') || !/"[^"]+"/g.test(lines[y]))
        {
            alteredFileContent += lines[y] + '\n';
        }
        else
        {
            // Generate a random string

            var randomString = '"';

            for (i = 0; i < 10; i++)
            {
                var charCode = Math.floor(Math.random() * 26) + 65;
                randomString += String.fromCharCode(charCode);
            }

            randomString += '"';

            // Replace all substrings between quotation marks with random string

            var stringPattern = RegExp('"[^"]+"', 'g');

            console.log(lines[y].match(stringPattern));

            var alteredLine = lines[y].replace(stringPattern, randomString);

            alteredFileContent += alteredLine + '\n';
        }
    }

    return alteredFileContent;
}

function swapGtLt(fileContent)
{
    var lines = fileContent.split('\n');

    var alteredFileContent = '';

    for (y = 0; y < lines.length; y++)
    {
        if (lines[y].match(/".*\/.*"/g) !== null || lines[y].includes('while') || lines[y].includes('@') || (!lines[y].includes('>') && !lines[y].includes('<')))
        {
            alteredFileContent += lines[y] + '\n';
        }
        else
        {
            // Find all indices of > characters

            var gtMatch;
            var gtIndices = [];
            var gtPattern = RegExp('>', 'g');

            while ((gtMatch = gtPattern.exec(lines[y])) !== null )
            {
                gtIndices.push(gtPattern.lastIndex - 1);
            }

            // Find all indices of < characters

            var ltMatch;
            var ltIndices = [];
            var ltPattern = RegExp('<', 'g');

            while ((ltMatch = ltPattern.exec(lines[y])) !== null )
            {
                ltIndices.push(ltPattern.lastIndex - 1);
            }

            var alteredLine = lines[y];

            // Change all > characters to <

            for (j = 0; j < gtIndices.length; j++)
            {
                alteredLine = alteredLine.substr(0, gtIndices[j]) + '<' + alteredLine.substr(gtIndices[j] + 1);
            }

            // Change all < characters to >

            for (j = 0; j < ltIndices.length; j++)
            {
                alteredLine = alteredLine.substr(0, ltIndices[j]) + '>' + alteredLine.substr(ltIndices[j] + 1);
            }

            alteredLine += '\n';
            alteredFileContent += alteredLine;
        }
    }
    return alteredFileContent;
}

function swapEqNeq(fileContent)
{
    var lines = fileContent.split('\n');

    var alteredFileContent = '';

    for (y = 0; y < lines.length; y++)
    {
        if (lines[y].match(/".*\/.*"/g) !== null || lines[y].includes('while') || lines[y].includes('@') || (!lines[y].includes('==') && !lines[y].includes('!=')))
        {
            alteredFileContent += lines[y] + '\n';
        }
        else
        {
            // Find all indices of == substrings

            var eqMatch;
            var eqIndices = [];
            var eqPattern = RegExp('==', 'g');

            while ((eqMatch = eqPattern.exec(lines[y])) !== null )
            {
                eqIndices.push(eqPattern.lastIndex - 2);
            }

            // Find all indices of != substrings

            var neqMatch;
            var neqIndices = [];
            var neqPattern = RegExp('!=', 'g');

            while ((neqMatch = neqPattern.exec(lines[y])) !== null )
            {
                neqIndices.push(neqPattern.lastIndex - 2);
            }

            var alteredLine = lines[y];

            // Change all == substrings to !=

            for (j = 0; j < eqIndices.length; j++)
            {
                alteredLine = alteredLine.substr(0, eqIndices[j]) + '!' + alteredLine.substr(eqIndices[j] + 1);
            }

            // Change all != substrings to ==

            for (j = 0; j < neqIndices.length; j++)
            {
                alteredLine = alteredLine.substr(0, neqIndices[j]) + '=' + alteredLine.substr(neqIndices[j] + 1);
            }

            alteredLine += '\n';
            alteredFileContent += alteredLine;
        }
    }
    return alteredFileContent;
}

function swapZeroOne(fileContent)
{
    var lines = fileContent.split('\n');

    var alteredFileContent = '';

    for (y = 0; y < lines.length; y++)
    {
        if (lines[y].match(/".*\/.*"/g) !== null || lines[y].includes('while') || lines[y].includes('@') || (!lines[y].includes('0') && !lines[y].includes('1')))
        {
            alteredFileContent += lines[y] + '\n';
        }
        else
        {
            // Find all indices of 0 characters

            var zeroMatch;
            var zeroIndices = [];
            var zeroPattern = RegExp('0', 'g');

            while ((zeroMatch = zeroPattern.exec(lines[y])) !== null )
            {
                zeroIndices.push(zeroPattern.lastIndex - 1);
            }

            // Find all indices of 1 characters

            var oneMatch;
            var oneIndices = [];
            var onePattern = RegExp('1', 'g');

            while ((oneMatch = onePattern.exec(lines[y])) !== null )
            {
                oneIndices.push(onePattern.lastIndex - 1);
            }

            // Change all 0 characters to 1

            var alteredLine = lines[y];

            for (j = 0; j < zeroIndices.length; j++)
            {
                alteredLine = alteredLine.substr(0, zeroIndices[j]) + '1' + alteredLine.substr(zeroIndices[j] + 1);
            }

            // Change all 1 characters to 0

            for (j = 0; j < oneIndices.length; j++)
            {
                alteredLine = alteredLine.substr(0, oneIndices[j]) + '0' + alteredLine.substr(oneIndices[j] + 1);
            }

            alteredLine += '\n';
            alteredFileContent += alteredLine;
        }
    }
    return alteredFileContent;
}

// ----------------------------------------------------------------------------------------------------

var allFiles = getSourceFilePaths();

console.log(allFiles.length);

var compilationFailure = true;

while (compilationFailure)
{
    console.log('\nFuzzing files...\n');

    var selectedFiles = [];

    while (selectedFiles.length < 5)
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
    else shell.exec('cd ../iTrust2-v1/ && git checkout -- .');

    console.log();
}
