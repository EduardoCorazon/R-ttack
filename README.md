# R-ttack
RF hacking transmitter

# Development
Note * you need to always restart the backend if you make changes

`node server.js`

After you git clone this project run `npm install` to get all the necessary dependencies

# Instructions for Ethan:

Click on Code and copy url
go to terminal 

`git clone {url}`
open terminal again

make your chages

`git add .`

`git commit -m "your message here" -s`

`git pull {repo}`

`git push {repo}`

# For connecting SDR

`usbipd list`

`usbipd bind -b 7-2`

`usbipd attach --wsl --busid 7-2`

`usbipd detach --wsl --busid 7-2`