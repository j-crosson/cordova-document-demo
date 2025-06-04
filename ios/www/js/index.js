var dialogEdit;
var closeButton;
var binEditBytes;

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady()
{
    // navigator.splashscreen.hide();
    iDocument.loaded = newData;
    dialogEdit = document.getElementById("dialog1"); //we only have a single dialog
    closeButton = document.getElementById("dialogbutton");
    closeButton.addEventListener("click", () => {
    dialogEdit.close();
    });
}

function selectItem(item)
{
    selectPane(item);
}

function selectPane(pane)
{
    switch (pane)
    {
        case 0: //create text doc
            document.getElementById("documentOptions").style.display =  "none";
            document.getElementById( "createDoc").style.display =  "block";
            document.getElementById("docText").textContent='Create text document "untitled.txt" in the Documents Directory.  If the file already exists, it will be overwritten.';
            document.getElementById("docButton").onclick = function() { iDocument.documentAction ('create', textDocCreated, operationFailed,['untitled.txt',iDocument.createOptions.overwrite])};
            //if we wanted to create an iCloud document (assuming configuration has been done)  in the "Documents" directory of the default Ubiquity Container, we could replace the above line with this one:
            //document.getElementById("docButton").onclick = function() { iDocument.documentAction ('create', textDocCreated, operationFailed,['untitledCloudDoc.txt',iDocument.createOptions.iCloud])};

            
            break;
        case 1: //create bin doc
            document.getElementById("documentOptions").style.display =  "none";
            document.getElementById( "createDoc").style.display =  "block";
            document.getElementById("docText").textContent='Create binary document "untitled.bin" in the Documents Directory.  If the file already exists, it will be overwritten.';
            document.getElementById("docButton").onclick = function() {iDocument.documentAction('create', binDocCreated, operationFailed,['untitled.bin',iDocument.createOptions.bin])};
            break;
        case 2: //user dir create
            document.getElementById("documentOptions").style.display =  "none";
            document.getElementById( "createDoc").style.display =  "block";
            document.getElementById("docText").textContent='Create text document "untitled.txt" in a user-selected directory.  If the file already exists, it will be overwritten.';
            document.getElementById("docButton").onclick = function() {iDocument.documentAction('create', textDocCreated, operationFailed,['untitled.txt',iDocument.createOptions.getDir])};
            break;
        case 3: //select and edit text doc
            iDocument.documentAction("selectDocument",textDocOpened,operationFailed,["documentsDirectory",[],["txt"]]);
            break;
        case 4://edit bin doc
            iDocument.documentAction("openDocument",binDocOpened,openFailed,["untitled.bin","documentsDirectory",true]);
            break;
        case 5: //edit text doc
            iDocument.documentAction("openDocument",textDocOpened,openFailed,["untitled.txt","documentsDirectory"]);
            //if we previously created an iCloud document, substitute the following line for the previous one.
            //iDocument.documentAction("openDocument",textDocOpened,openFailed,["untitledCloudDoc.txt","iCloud"]);
            break;
    }
}

function openFailed()
{
    dialogEdit.showModal();
}

// In a real app, more sophisticated error handling would be in order
// For example, on an iCloud "save" fail, conflict resolution may be required.
// If an iCloud save fails because an update is incoming
// a retry might not be necessary because we would recive an "update" notification
// when the document update is completed.
// This demo handles the update (in a very simple way), and in the case of a failed
// save requires a user "save" retry to exit (since "save" is really save and exit).

function operationFailed(arg)
{
    console.log('*failed* '+ arg);
}

function docSaved()
{
    iDocument.documentAction ("close",operationComplete, operationFailed);
}
function operationComplete(status)
{
    goHome();
}

function goHome()
{
    document.getElementById("createDoc").style.display =  "none";
    document.getElementById( "editBin").style.display =  "none";
    document.getElementById( "editText").style.display =  "none";
    document.getElementById("documentOptions").style.display =  "block";
}

//
//Text Document
//

function textDocCreated()
{
    iDocument.documentAction ("save",docSaved, operationFailed, ["This is  a text document created by iDocument Demo."]);
}

function textDocOpened(text)
{
    document.getElementById('textgraph').innerHTML = text;
    
    // we only care about status for iCloud.  If we were only dealing with local documents
    // we could skip this and subsequent steps and display the document now
    iDocument.documentAction ("getStatus",checkTextDocStatus, operationFailed, [0])
}

// Check for iCloud version conflict. If found, get a list of conflicting versions as
// a first step in conflict resolution.
function checkTextDocStatus (status)
{
    if(status.includes(iDocument.returnStatus.inConflict))
        iDocument.documentAction("getOtherVersions",resolve,resolved);
    else
    {
        document.getElementById("documentOptions").style.display =  "none";
        document.getElementById( "editText").style.display =  "block";
    }
}

function resolve (numberOfVersions)
{
    //  In this demo we choose to resolve the version conflict by selecting the current version:
    // "numberOfVersions", the number of conflicting versions, is not needed in this case.
    // "Current version" is what iCloud thinks is the current version, not necessarily what we are currently
    // displaying.
    
    iDocument.documentAction("resolve",resolved,operationFailed,["current",0]);

    // An alternate approach is to resolve the conflict by selecting a conflict version
    // as the current version of the file or by merging conflicting versions and making
    // the resulting file the current version
    
    // To demo this, comment out the above documentAction and substitute the following line:
    
    // iDocument.documentAction("openOther",getOther,operationFailed,[0]);
    
    // In this alternate demo, we are going to select the first conflict version of the file
    // as the conflict winner and make it the current version, erasing other versions.
    // First we open the first conflicting version which we are guaranteed to have, so we
    // don't check "numberOfVersions".  In a real app we would potentially have to deal
    // with more than one conflicting version. We don't do anything with this
    // version of the file--we are just going to declare the first conflict version the
    // conflict winner--but would need to if we were merging or comparing versions.
}

function resolved()
{
    // we need to do a "getData" given the type of resolution we've selected: iCloud current version.
    // The document has loaded the current document data but not synced it with our view
    // If we were to resolve the conflict by selecting another version of the document
    // "newData" would update the view.
    // "getData" is redundant for the conflict-on-load case but we do it anyway just
    // to make the demo a bit more simple
    iDocument.documentAction("getData",updateRecieved,operationFailed,[0]); ///zzz need zero?
}

//new document data loaded.  This can be data from another device updating our iCloud file
//or data reload triggered by conflict resolution
function newData(documentStatus)
{
    // When we get an update from another device we would typically do something like
    // merging the data but for the demo we just refresh our view with the new data.
    // There could be a conflict--say if another device updated our iCloud file while in
    // Airplane Mode and then came back online thus creating a conflict with the updates we
    // made while the other user was offline.  In this case, we resolve the conflict.
    
    //not handling "bin" conflicts for demo
    if(documentStatus.includes(iDocument.returnStatus.inConflict) && documentStatus.includes(iDocument.returnStatus.typeUTF8))
    {
        iDocument.documentAction("getOtherVersions",resolve,resolved);
    }
     else
        iDocument.documentAction("getData",updateRecieved,operationFailed,[0]);
}

function updateRecieved (theData)
{
    document.getElementById('textgraph').innerHTML = theData;
    document.getElementById("documentOptions").style.display =  "none";
    document.getElementById( "editText").style.display =  "block";
}

// Recieves the conflict version text
function getOther(text)
{
    console.log(text);
    iDocument.documentAction ("close",resolveWithOther, operationFailed,[iDocument.documentID.otherDocument]);

    // If we wanted to do a merge, we would merge "text" with our current content,
    // declare the current file version the conflict winner, and save the merged text as follows:
    
    // doMerge(text);
    // iDocument.documentAction ("close", resolve ....
    
    // "resolve" would select the current version as conflict winner
    // iDocument.documentAction("resolve",saveNewVersion,failed,["current"]);
 
    // "saveNewVersion" would save the merged content
}

function resolveWithOther()
{
    // For this demo we are going to make the first conflict version the current file.
    // This will cause the current document to be replaced with this version
    
    iDocument.documentAction("resolve",finished,operationFailed,["version",0]);
}

function finished()
{
    //we don't need to do a "getData" because we load updated data in "newData"
}

function saveTextDocAndExit()
{
    let theText = document.getElementById('textgraph').innerHTML;
    iDocument.documentAction("save",docSaved,operationFailed,[theText]);
}


//
//Binary Document
//

const byteToHex = (byte) => {
    const key = '0123456789ABCDEF';
    let newHex = '';
    let currentChar = 0;
    
    currentChar = (byte >> 4);      // First 4-bits for first hex char
    newHex += key[currentChar];     // Add first hex char to string
    currentChar = (byte & 15) ;     // Erase first 4-bits, get last 4-bits for second hex char
    newHex += key[currentChar] ;    // Add second hex char to string
    return newHex;
}

const hexToByte = (hexHigh, hexLow) => {
    const key = '0123456789ABCDEF';
    let hexChar = 0;
    let hexBytes = new Uint8Array(1);

    hexChar = key.indexOf(hexHigh);
    hexBytes[0] = (hexChar << 4); // Get 4-bits from first hex char
    hexChar = key.indexOf(hexLow);
    hexBytes[0] += (hexChar);     // Concat 4-bits from second hex char
    return hexBytes[0];
}

//
// on sucessfully creating a bin doc, we save "00,01,02,FF"
//

function binDocCreated()
{
    let arr8 = new Uint8Array([0, 1, 2, 255]);
    iDocument.documentAction("save",docSaved,  operationFailed, [arr8.buffer]);
}

//
// Edit Binary Document
//

function keyup(event) {
    let regEx = /^[0-9A-F]+$/;
    let isHex = regEx.test(event.target.value.toString());
    if(!isHex) {
        event.target.value = event.target.value.slice(0, -1);
    }
}

function binDocOpened(bin)
{
    let bytes = new Uint8Array(bin);
    binEditBytes = bytes;
    let hexString ="";
    for (const theByte of bytes)
    {
        hexString += byteToHex(theByte);
    }
    displayBinDoc(hexString);
    document.getElementById("documentOptions").style.display =  "none";
    document.getElementById( "editBin").style.display =  "block";
}

//
// display the 4-byte demo document
//
function displayBinDoc(hexString)
{
    const inputs =  document.getElementById( "editBin").getElementsByTagName("input");
    let index = 0;
    for (const element of inputs)
    {
        element.value = hexString[index++];
    }
}

function saveBinDocAndExit()
{
    let bytes = getBinEditBytes();
    if(bytes == null)
    {
        //showEditError();
        return;
    }
    iDocument.documentAction ("save",docSaved,  operationFailed('Save'), [bytes.buffer]);
}

//
// returns edited  bytes array.  We catch most errors--enough for a demo--in
// which case we return "null"
//

function getBinEditBytes()
{
    const inputs =  document.getElementById( "editBin").getElementsByTagName("input");
    let index = 0;
    let hexString = [];
    let bytes = new Uint8Array(4);
    for (const element of inputs)
    {
        if( element.value == "")
            return null;
        hexString += element.value;
    }
    let ii = 0;
    for (let i = 0; i < hexString.length - 1; i+=2)
    {
        let hb = hexToByte(hexString[i],hexString[i+1]);
        bytes[ii++] = hb;
    }
    return bytes;
}

