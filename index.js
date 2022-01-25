#!/usr/bin/env node

/* 

Title: busy-bzz

Project Description: 
This project gives users the ability to routinely 
backup files using web3's Swarm protocol 


*/

var path = require('path')
var fs = require('fs')
var Web3 = require('web3');
var web3 = new Web3()
web3.bzz.setProvider('https://swarm-gateways.net')

const args = process.argv
const PREF_FILE_PATH = __dirname + "/pref.json"
const LOG_FILE_PATH = __dirname + "/logfile.json"
const HELP_TEXT = `                                   
                                                         
busy-bzz Swarm Utility      


Description:                                           
    busy-bzz is a swarm utility allows a user to Select and schedule      
    groups of files to be uploaded to the Swarm network   

    usage: 
      (busy-bzz) bb <command>
        
      commands:

       start:      Start busy-bzz Swarm recovery process. 
        
        Example ---> bb start

       add:        Schedule a file for backup; by default not including hours and minutes will default the back up time to the current time
        
        Example ---> bb add [filepath]       
        Example ---> bb add [filepath] [hour (00 - 23) : minutes (00 - 59)] 
                | 
                --> bb add /filepath/file.txt 15:48
                --> bb add /filepath/file.txt 

       remove:     Remove a file from backup schedule
        
        Example ---> bb remove [filepath]

       view:       View current scheduled files      

        Example ---> bb view 

       history:        View log of previous backups
       
        Example ---> bb history 

       download:   Download a specific file  
      
        Example ---> bb download [swarm address] [destination filepath] 
                 
       help:       Display help   
        
        Example ---> bb help
`;

captureUserInput()

function captureUserInput()
{
    switch(args[2])
    {

        case 'start':
            start()
        break 

        case 'add':
            add(args[3], args[4])
        break

        case 'remove':
            remove(args[3])
        break

        case 'view':
            view()
        break

        case 'help':
            console.log(HELP_TEXT) 
        break

        case 'history':
            history()
        break

        case 'download':
            download(args[3], args[4])
        break

        default: 
            console.log('Please choose a correct menu option')
            console.log(HELP_TEXT)
        break
    }
}

//HELPER METHODS

function modifyPreferenceFile(preferences){
    
    if (fs.existsSync(PREF_FILE_PATH))
    {
        console.log("File exist updating preference file")
        fs.readFile(PREF_FILE_PATH, function (err, data) {
            console.log('Saving user preferences...')
            let json = JSON.parse(data)
            json.Pref.push(preferences)
            fs.writeFileSync(PREF_FILE_PATH, JSON.stringify(json))
        })
    }

    else
    {
        console.log("File does not exist; creating preference file")
        let initPrefObj = {
            Pref : [preferences]
        }

        let data = JSON.stringify(initPrefObj)  
        fs.writeFileSync(PREF_FILE_PATH, data)
    }
}

function modifylogfile(logJson)
{
    if (fs.existsSync(LOG_FILE_PATH))
    {
        console.log("Updating log file...")
        fs.readFile(LOG_FILE_PATH, function (err, data) {

            if (err)
                console.log('An error occurred updating log file')

            console.log('updating json log file')
            let json = JSON.parse(data)
            json.Logs.push(logJson)
            fs.writeFileSync(LOG_FILE_PATH, JSON.stringify(json))        
        })
    }

    else
    {
        console.log("File does not exist; creating logfile.json file")
        let data = JSON.stringify({ Logs : [logJson]})  
        fs.writeFileSync(LOG_FILE_PATH, data)
    }
}

//COMMAND remove()
async function remove(filepath)
{
    try
    {
        if (fs.existsSync(PREF_FILE_PATH))
        {                   
            fs.readFile(PREF_FILE_PATH, function (err, data) {
                
                if (err)
                    console.log("An error occurred opening Preference file: " + err)

                let prefJson = JSON.parse(data)
                let counter = 0;
                let found = false;
                let elementsForDeletion = []

                prefJson.Pref.forEach(pref => {

                    if (pref.file_path === filepath)
                    {
                        //found = true;
                        console.log("Found pref property: " + pref.file_path)                        
                    }
                    else
                    {
                        //if (!found)  //Added because you can't manually break collection.foreach (that I know of)
                        //{   
                            elementsForDeletion.push(counter) //Contains elements that use the given file path (may remove duplicate file paths for now)
                            counter++;
                       // }
                    }
                })

                //Delete preferences that contain the specified file path
                elementsForDeletion.forEach(element => {
                    console.log("Deleteing element " + prefJson.Pref[element])
                    prefJson.Pref.splice(element,1)
                })

                removePreferenceElement(prefJson)
            })
        }

        else
        {
            console.log("There are currently no files scheduled that can be removed")
        }
    }

    catch(exception)
    {
        console.log(exception)
    }
}

function removePreferenceElement(json){
    
    if (fs.existsSync(PREF_FILE_PATH))
    {
        console.log("File exist updating preference file")
        fs.writeFileSync(PREF_FILE_PATH, JSON.stringify(json))
    }
}

//COMMAND view()
function view()
{
    try
    {
        if (fs.existsSync(PREF_FILE_PATH))
        {                   
            fs.readFile(PREF_FILE_PATH, function (err, data) {
                if (err)
                    console.log("An error occurred opening log file: " + err)

                let json = JSON.parse(data)

                console.table(json.Pref)
            })
        }

        else
        {
            console.log("There are currently no files scheduled for backup")
        }
    }

    catch(exception)
    {
        console.log(exception)
    }
}

//COMMAND download()
async function download(hashaddress, downloadDest)
{
    if (hashaddress != null && hashaddress.length > 0 && downloadDest != null && downloadDest.length > 0)
    {
        try
        {
            //get file address and file path 
            if (fs.existsSync(LOG_FILE_PATH))
            {
                console.log("File exist updating preference file")
            
                fs.readFile(LOG_FILE_PATH, function (err, data) {
                    console.log('Saving user preferences...')

                    if (err)
                    {
                        console.log("Error encountered opening log file")
                    }

                    let json = JSON.parse(data)
                    let foundFile = false
                    let searchedFileNames = []

                    json.Logs.forEach(log => {
                    
                        if (log.address == hashaddress)
                        {
                            if (!searchedFileNames.includes[log.file_path])
                            {
                                console.log("Found address: " + hashaddress)
                                web3.bzz.download(hashaddress).then(
                                    function(buffer)
                                    {
                                        //console.log("downloaded file: ", buffer.toString())                                
                                        console.log("downloaded file: " + log.file_path)
                                        fs.writeFileSync(downloadDest, buffer, {flag:'a+'})
                                        foundFile = true
                                    }
                                )
                                searchedFileNames.push(log.file_path)
                            }
                        }
                    })

                    if (!foundFile)
                        console.log("Swarm Address: " + hashaddress + " does not exist")
                    else
                    {
                        fs.writeFileSync(LOG_FILE_PATH, JSON.stringify(json))
                    }
                })
            }
            else 
            {
                console.log("No files have been backed up to Swarm yet...")
            }        
        }

        catch(exception)
        {
            console.log(exception)
        }
    }
    else 
    {
        console.log("Please provide a valid Swarm Hash Address and Destination File path")
        console.log("Example : bb download [swarm address] [destination filepath]")
    }
}

//COMMAND add()
function add(filepath, time)
{
    try
    {
        let prefInput = {
            filepath: filepath,
            time: time, 
        }
        handleUserPreferenceInput(prefInput)
    }
    catch(exception)
    {
        console.log(exception)
    }
}

function handleUserPreferenceInput(prefInput)
{
    let hour = null
    let min = null
    let filenames = []
    let currdate = new Date();
    let hasTimeError = false;

    if (prefInput.filepath)
    {
        console.log("Filepath: " + prefInput.filepath)
    }

    else 
    {
        console.log('Please enter a correct file path')
        return 
    }
    
    if (prefInput.time)
    {
        //check for appropriate formatting
        hour = prefInput.time.substr(0,2)
        min = prefInput.time.substr(3,2)    

        if (parseInt(hour) > 24 || isNaN(hour))
        {
            console.log("The entered hour was too large, Please select a value less than or equal to 24")
            hasTimeError = true;
        }

        if (parseInt(min) > 59 || isNaN(min))
        {
            console.log("The entered minute was too large, Please select a value less than or equal to 59")
            hasTimeError = true;
        }
    }
    else
    {
        let unformattedHour = currdate.getHours()
        let unformattedMin = currdate.getMinutes()
        
        if (unformattedHour < 10)
            hour = "0" + unformattedHour.toString()
        else 
            hour = unformattedHour.toString()

        if (unformattedMin < 10)
            min = "0" + unformattedMin.toString()
        else 
            min = unformattedMin.toString()
    }    

    if (!hasTimeError)  //Only after no time error has been received after correct time hour and minutes have been 
    {
        filenames.push(prefInput.filepath)
        
        filenames.forEach(fullfilepath =>{
        
            let filepath = path.normalize(fullfilepath)
            let filename = path.basename(fullfilepath)
            
            let preference = {
                file_name: filename,
                file_path: filepath,
                swarm_address: "",
                run_hour: hour,
                run_min: min,
            }

            modifyPreferenceFile(preference)    
        }) 
    }
}

//COMMAND start()
function start()
{
    if (fs.existsSync(PREF_FILE_PATH))
    {
        fs.readFile(PREF_FILE_PATH, function (err, data) {
            
            let json = JSON.parse(data) 
            
            if (err)
                console.log("An error has occurred when scanning for files to back up")
            
            else 
            {
                console.log("Beginning 24/7 busy-bzz scan...")
                processPreferences(json) //Runs immediately to check for current files to backup 
                setInterval(() => processPreferences(json), 60000)  //Runs indefinitely after the initial run
            }
        })
    }

    else
    {
        console.log('There are currently no files scheduled for back up')
        console.log('Please use the add command to schedule a file')
    }
}

function processPreferences(json)
{
    json.Pref.forEach(pref => { 
                                
        let date = new Date()
        if (date.getHours() === parseInt(pref.run_hour))
        {
            if (date.getMinutes() === parseInt(pref.run_min))
            {
                backupfiles(pref.file_name, pref.file_path, date)
            }
        }
    })    
}

async function backupfiles(filename, filepath, currDate) 
{
    try 
    {            
        console.log("Backing up file " + filename + " now...")
        let filebytesstring = fs.readFileSync(filepath)  //Returns buffer object
        let hashaddress = await web3.bzz.upload(filebytesstring)  //Uploads buffer object to swarm network 
                    
        if (hashaddress)
        {
            console.log("Successfully backed up file: " + filename)

            let logjson = {
                address: hashaddress,
                file_name: filename,
                file_path: filepath,
                upload_date: currDate.getMonth() + 1 + "/" + currDate.getDate() + "/" + currDate.getFullYear(),
                exist: true,                  
            }     

            modifylogfile(logjson)  //updates Log File 

            if (hashaddress)
                updatePreferenceFileAddress(hashaddress, filepath)  
            else
                console.log("Error received Swarm address after uploading file...")

            counter = 0; //reset counter once hash found         
        }

        counter++       
    }
    catch(exception)
    {
        console.log(exception)
    }
}

function updatePreferenceFileAddress(hashaddress, file_path)
{    
    if (fs.existsSync(PREF_FILE_PATH))
    {
        console.log("Updating preference file with file address")
        fs.readFile(PREF_FILE_PATH, function (err, data) {

            if (err)
            {
                console.log("An error has occurred while attempting to update the preference file")
            }

            else
            {            
                let json = JSON.parse(data)
                json.Pref.forEach(pref => 
                {
                    if (pref.file_path === file_path)
                    {
                        pref.swarm_address = hashaddress
                    }
                })

                fs.writeFileSync(PREF_FILE_PATH, JSON.stringify(json))
            }
        })
    }

    else
    {
        console.log("Unable to find preference file after uploading file to Swarm")
    }
}

//COMMAND history()
function history()
{
    if (fs.existsSync(LOG_FILE_PATH))
    {
        fs.readFile(LOG_FILE_PATH, function (err, data) {
            
            if (err)
            {
                console.log("An error occurred checking for files to backup...")
                return
            }
            
            //Parse each element of the preference json's object  
            let json = JSON.parse(data)  
            console.table(json.Logs)
        })
    }
    else
    {
        console.log("No files have been backed up yet")
    }
}
