const esprima = require('esprima');
const fs = require('fs');

let buf = fs.readFileSync('./server.js', 'utf8');
let ast = esprima.parseScript(buf);

const jsonForDesignSurvey =
[
    `{ markdown: '{}\\n---\\n# Test' }`
];

const jsonForCreateStudy =
[
    `{ invitecode: '' }`,
    `{ name: 'Created Survey', description: 'Description for created survey.', studyKind: 'survey', researcherName: 'John Smith', contact: 'test@test.com', awards: [], invitecode: 'RESEARCH', markdown: '# Markdown', token: 'survey_token' }`,
    `{ name: 'Created Data Study', description: 'Description for created data study.', studyKind: 'dataStudy', researcherName: 'John Smith', contact: 'test@test.com', awards: [], invitecode: 'RESEARCH', markdown: '# Markdown', token: 'data_study_token' }`
];

const jsonForSubmitVote =
[

];

const jsonForOpenCloseStudy =
[
    `{ token : 'token_zero' }`
];

const jsonForNotifyParticipant =
[
    `{ email: '', kind: '' }`,
    `{ email: 'test@test.com', kind: 'AMZN' }`,
    `{ email: 'test@test.com', kind: 'SURFACE' }`,
    `{ email: 'test@test.com', kind: 'IPADMINI' }`,
    `{ email: 'test@test.com', kind: 'GITHUB' }`,
    `{ email: 'test@test.com', kind: 'BROWSERSTACK' }`
];

const idsForGet =
[
    `000000000000000000000000`
];

const tokensForGet =
[
    `token_zero`,
    `token_one`,
    `token_two`,
    `token_three`
];

var testFileString = `const request = require('request');\n\n`

var getCalls = [];
var getCallsWithIds = [];
var getCallsWithTokens = [];

var postCalls = [];

traverse(ast, function(node)
{
    if (node.type === 'CallExpression' && node.callee.object && node.callee.object.name === 'app' && node.arguments[0].type === 'Literal')
    {
        if (node.callee.property.name === 'get')
        {
            var callPath = node.arguments[0].value;
            if (callPath.includes(':'))
            {
                callPathComponents = callPath.split(':');
                if (callPathComponents[1] === 'id') getCallsWithIds.push(callPathComponents[0]);
                else if (callPathComponents[1] === 'token') getCallsWithTokens.push(callPathComponents[0]);
            }
            else getCalls.push(callPath);
        }

        if (node.callee.property.name === 'post')
        {
            var callPath = node.arguments[0].value;
            postCalls.push(callPath);
        }
    }
});

testFileString += `// 'GET' CALLS\n\n`;

for (i = 0; i < getCalls.length; i++)
{
    if (getCalls[i] === '/api/study/vote/status') testFileString += generateGetRequestWithQueries(getCalls[i]);

    testFileString += generateGetRequest(getCalls[i]);
}

testFileString += `\n// 'GET' CALLS WITH IDS\n\n`;

for (i = 0; i < getCallsWithIds.length; i++)
{
    for (j = 0; j < idsForGet.length; j++)
    {
        testFileString += generateGetWithIdRequest(getCallsWithIds[i], idsForGet[j]);
    }
}

testFileString += `\n// 'GET' CALLS WITH TOKENS\n\n`;

for (i = 0; i < getCallsWithTokens.length; i++)
{
    if (getCallsWithTokens[i] === '/api/study/admin/assign/') testFileString += generateGetWithTokenRequest(getCallsWithTokens[i], 'token_four');

    for (j = 0; j < tokensForGet.length; j++)
    {
        testFileString += generateGetWithTokenRequest(getCallsWithTokens[i], tokensForGet[j]);
    }
}

testFileString += `\n// 'POST' CALLS\n\n`;

for (i = 0; i < postCalls.length; i++)
{
    if (postCalls[i] === '/api/design/survey')
    {
        for (j = 0; j < jsonForDesignSurvey.length; j++)
        {            
            testFileString += generatePostRequest(postCalls[i], jsonForDesignSurvey[j]);
        }
    }

    if (postCalls[i] === '/api/study/admin/open/' || postCalls[i] === '/api/study/admin/close/')
    {
        for (j = 0; j < jsonForOpenCloseStudy.length; j++)
        {
            testFileString += generatePostRequest(postCalls[i], jsonForOpenCloseStudy[j]);
        }
    }

    if (postCalls[i] === '/api/study/admin/notify/')
    {
        for (j = 0; j < jsonForNotifyParticipant.length; j++)
        {
            testFileString += generatePostRequest(postCalls[i], jsonForNotifyParticipant[j]);
        }
    }

    if (postCalls[i] === '/api/study/create')
    {
        for (j = 0; j < jsonForCreateStudy.length; j++)
        {
            testFileString += generatePostRequest(postCalls[i], jsonForCreateStudy[j]);
        }
    }
}

function generateGetRequest(callString)
{
    return `request( { url: 'http://localhost${callString}', method: 'GET' }, function(error, response, body) { } );\n`;
}

function generateGetRequestWithQueries(callString)
{
    return `request( { url: 'http://localhost${callString}', method: 'GET', qs: { fingerprint: 'fingerprint', studyId: '000000000000000000000000' } }, function(error, response, body) { } );\n`;    
}

function generateGetWithIdRequest(callString, id)
{
    return `request( { url: 'http://localhost${callString + id}', method: 'GET' }, function(error, response, body) { } );\n`;
}

function generateGetWithTokenRequest(callString, token)
{
    return `request( { url: 'http://localhost${callString + token}', method: 'GET' }, function(error, response, body) { } );\n`;
}

function generatePostRequest(callString, json)
{
    return `request( { url: 'http://localhost${callString}', method: 'POST', json: ${json} }, function(error, response, body) { } );\n`;
}

fs.writeFileSync('./test.js', testFileString);

/**
 * Traverse an object tree, calling the visitor at each visited node.
 * 
 * @param {*} object    Esprima node object.
 * @param {*} visitor   Visitor called at each node.
 */
function traverse(object, visitor)
{
    visitor(object);

    for (let key in object)
    {
        if (object.hasOwnProperty(key))
        {
            let child = object[key];
            if (typeof child === 'object' && child !== null)
            {
                traverse(child, visitor);
            }
        }
    }
}