# busybee

What is busybee? 

A command line application for backing up and recovering files with the web3 Swarm Protocol 

# Install


npm install -g busybee

# Usage 

Description:
    busybee is a swarm utility allows a user to Select and schedule
    groups of files to be uploaded to the Swarm network

    usage:
      (busybee) bb <command>

      commands:

       start:      Start BusyBee Swarm recovery process.

        Example ---> bb start

       add:        Schedule a file for backup

        Example ---> bb add [filepath]
        Example ---> bb add [filepath] [hour : minutes]

       remove:     Remove a file from backup schedule

        Example ---> bb remove [filepath]

       view:       View current scheduled files

        Example ---> bb view

       log:        View log of previous backups

        Example ---> bb log

       download:   Download a specific file

        Example ---> bb download [swarm address] [destination filepath]

       help:       Display help

        Example ---> bb help


# Author
Jonathan Howard
* github: @https://github.com/JonathanHowardDev1/

