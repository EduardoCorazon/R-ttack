/*
Documentation: https://nodejs.org/api/child_process.html
Package Install: npm install child_process
To do: check if package is secure for deployment
 */

const { exec } = require('child_process');

const checkRtlSdrInstallation = () => {
    return new Promise((resolve, reject) => {
        // Use the 'exec' function to run the 'rtl_sdr' command
        exec('rtl_sdr', (error, stdout, stderr) => {
            if (error) {
                reject(`Error checking rtl_sdr installation: ${error.message}`);
                return;
            }

            // Check if the 'rtl_sdr' command is in the system path
            if (stderr) {
                reject(`rtl_sdr is not installed on the system: ${stderr}. Please reference the Quick Start Guide for how to install rtl_sdr at https://www.rtl-sdr.com/rtl-sdr-quick-start-guide/`);
                return;
            }

            // If 'rtl_sdr' is installed, resolve with a success message
            resolve('rtl_sdr is installed on the system');
        });
    });
};

module.exports = { checkRtlSdrInstallation };