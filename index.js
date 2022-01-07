#!/usr/bin/env node

/* 

Title: busybee

Project Description: 
This project gives users the ability to routinely 
backup files using 'web3's Swarm protocol 


*/

var inquirer = require('inquirer')
var fs = require('fs')
var CronJob = require('cron').CronJob

var Web3 = require('web3');
const path = require('path');
var web3 = new Web3()
web3.bzz.setProvider('https://swarm-gateways.net')

const args = process.argv
const currentdirectory = process.cwd()
const PREF_FILE_PATH = './pref.json'
const LOG_FILE_PATH = './logfile.json'
const HELP_TEXT = `                                   
                                                         
busybee Swarm Utility      


Description:                                           
    busybee is a swarm utility allows a user to Select and schedule      
    groups of files to be uploaded to the Swarm network   

    usage: 
      (busybee) bb <command>
        
      commands

       start:      Start BusyBee Swarm recovery process. 

       add:        Schedule a file for backup  
        
        Example =>   add [filepath]       
        Example =>   add [filepath] [hour : minutes] 
        Example =>   add [filepath] [hour : minutes] [frequency]

       remove:     Remove a file from backup schedule
        

       view:       View current scheduled files      

       
       log:        View log of previous backups

       
       download:   Download a specific file  
      
         Example =>  download [swarm address] [destination filepath] 
        
         
       help:       Display help       
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
            add(args[3], args[4], args[5])
        break

        case 'remove':
            remove()
        break

        case 'view':
            view()
        break

        case 'help':
            console.log(HELP_TEXT) 
        break

        case 'history':
            viewHistory()
        break

        case 'download':
            if (args[3] != null && args[4] != null)
                download(args[3], args[4])
        break

        default: 
            console.log('Please choose a correct menu option')
            console.log(HELP_TEXT)
        break
    }
}


async function remove()
{
    try
    {

    }

    catch(exception)
    {
        console.log(exception)
    }
}

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

async function download(hashaddress, downloadDest)
{
    if (hashaddress == null)
        throw exception("hashaddress can't be null")

    if (downloadDest == null)
        console.log("No download destination was given. Downloading to currently directory")

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
                
                json.Logs.forEach(log => {
                
                    if (log.address == hashaddress)
                    {
                        console.log("Found address: " + hashaddress)
                        web3.bzz.download(hashaddress).then(function(buffer){
                            console.log("downloaded file: ", buffer.toString())
                            fs.writeFileSync(downloadDest, buffer, {flag:'a+'})
                        })
                    }
                });
                
                fs.writeFileSync(LOG_FILE_PATH, JSON.stringify(json))
            })
        }
        else 
        {
            console.log("File does not exist to download...")
        }        
    }

    catch(exception)
    {
        console.log(exception)
    }
}

function add(filepath, time, frequency)
{
    try
    {
        //handleUserPreferenceInput(filepath)
        var prefInput = {
            filepath: filepath,
            time: time, 
            frequency: frequency
        }
        handleUserPreferenceInputII(prefInput)

        //Initilizes cron job to pick up latest preferences 
        //startCronJob()
    }
    catch(exception)
    {
        console.log(exception)
    }
}

function handleUserPreferenceInputII(prefInput)
{
    /*
        Example =>   add [filepath]       
        Example =>   add [filepath] [hour : minutes] 
        Example =>   add [filepath] [hour : minutes] [frequency]
    */  
    let hour = null
    let min = null
    let frequency = null
    let filenames = []
    let formattedfilepaths = []
    let plainfilenames = []

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
        
        /*
        if (isNaN(hour))
            console.log("Not a real hour number: " + hour) 

        else 
            console.log("Real number: " + hour)

        if (isNaN(min))
            console.log("Not a real min number: " + min)

        else 
            console.log("Real number: " + min)

        */
    }
    else
    {
        hour = "00"
        min = "00"
    }

    if (prefInput.frequency)
    {
        frequency = prefInput.frequency
        console.log("frequency: " + prefInput.frequency)
    }
    else 
    {
        frequency = "w"
    }

    filenames.push(prefInput.filepath)
    
    filenames.forEach(filename =>{
        formattedfilepaths.push(filename)
        plainfilenames.push(path.basename(filename)) 
    })
    
    let preferences = {
        filenames: plainfilenames,
        filepath: formattedfilepaths,
        hour: hour,
        minute: min,
        frequency: prefInput.frequency,
    }
    console.log(preferences)

    modifyPreferenceFile(preferences)
}

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

function start()
{
    if (fs.existsSync(PREF_FILE_PATH))
    {
        fs.readFile(PREF_FILE_PATH, function (err, data) {
            let date = new Date()
            let json = JSON.parse(data) 

            setInterval(() => processPreferences(json, date), 1000)            
        })
    }
}

function processPreferences(json, date)
{
    json.Pref.forEach(pref => { 
                                
        if (date.getHours() === parseInt(pref.hour))
        {
            if (date.getMinutes() === parseInt(pref.minute))
            {
                console.log(pref.hour + "|" + pref.minute)
                backupfiles(pref.filenames, filepaths, date)
            }
            else
            {
                console.log(pref.hour + "|" + pref.minute)
            }
        }
    })    
}

function viewHistory(){
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

async function backupfiles(filenames, filepaths, currDate) 
{
    try 
    {            
        let counter = 0
        for (let filename of filenames)
        {
            console.log("Backing up file " + filename + " now...")

            let filebytesstring = fs.readFileSync(filepaths[counter])  //Returns buffer object
            let hashaddress = await web3.bzz.upload(filebytesstring)   //Uploads buffer object to swarm network 
                        
            if (hashaddress)
            {
                console.log("Successfully backed up file: " + filename)

                var logjson = {
                    address: hashaddress,
                    file_name: filename,
                    file_path: filepaths[counter],
                    upload_date: currDate.getMonth() + "/" + currDate.getDate() + "/" + currDate.getFullYear(),
                    exist: true,                  
                }     

                modifylogfile(logjson)  //updates Log File 

                counter = 0; //reset counter once hash found         
            }

            counter++
        }
    }
    catch(exception)
    {
        console.log(exception)
    }
}