# busy-bzz

What is busy-bzz? 

A command line application for backing up and recovering files with the web3 Swarm Protocol 

# Install


npm install -g busy-bzz

# Usage 

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



# Author
Jonathan Howard
* github: @https://github.com/JonathanHowardDev1/

