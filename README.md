Multiplayer-Game-Server
=======================

A Massively Multiplayer Online Role Playing Game server made specifically for MapleStory using NodeJS.

This server is for Version 83 of Global MapleStory, also known as v0.83.

I am in no way affiliated with MapleStory, Nexon, or Wizet and all of these files have been created by myself.
I found out all of the MapleStory packet specific information by searching it up on the internet.

Installation guide:
    1. Create a SQL schema called root (will be changed to msps in the future)
    2. Download a v0.83 SQL file and execute that in the newly created schema to create the database
    3. Download a "localhost.exe" executable client for v0.83 and place it in the install directory of v0.83
    4. Rename the "localhost.exe" to "MapleStory.exe" overwriting any changes

Usage for a local server:
    1. Start a SQL service for the root SQL schema
    2. Run app.js ("node app.js" in command line, will change the name later on)
    3. Run "MapleStory.exe"

If you have any issues, you can e-mail me, Tyler Adams, at daretyleradams@gmail.com

