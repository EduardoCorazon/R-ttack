const {exec} = require('child_process');

const checkRtlSdrInstallation = () => {
    return new Promise((resolve, reject) => {
        exec('which rtl_sdr', (error, stdout, stderr) => {
            if (error) {
                reject(`Error checking rtl_sdr installation: ${error.message}`);
                return;
            }
            if (stderr) {
                reject(`rtl_sdr is not installed on the system: ${stderr}. Please reference the Quick Start Guide for how to install rtl_sdr at https://www.rtl-sdr.com/rtl-sdr-quick-start-guide/`);
                return;
            }
            resolve('rtl_sdr is installed on the system');
        });
    });
};

const checkSoxInstallation = () => {
    return new Promise((resolve, reject) => {
        exec('which sox', (error, stdout, stderr) => {
            if (error) {
                reject(`Error checking sox installation: ${error.message}`);
                return;
            }
            if (stderr) {
                reject(`sox is not installed on the system: ${stderr}. Please reference the Quick Start Guide`);
                return;
            }
            resolve('sox is installed on the system');
        });
    });
};

const checkFfmpegInstallation = () => {
    return new Promise((resolve, reject) => {
        exec('which ffmpeg', (error, stdout, stderr) => {
            if (error) {
                reject(`Error checking ffmpeg installation: ${error.message}`);
                return;
            }
            if (stderr) {
                reject(`ffmpeg is not installed on the system: ${stderr}. Please reference the Quick Start Guide`);
                return;
            }
            resolve('ffmpeg is installed on the system');
        });
    });
};

// *** EDIT ***
// for demonstration purposes we set this to showcase an error
const checkLCJSVerification = () => {
    return new Promise((resolve, reject) => {
        exec('which fd', (error, stdout, stderr) => {
            if (error) {
                reject(`Error checking LightningChartJs activation: ${error.message}`);
                return;
            }
            if (stderr) {
                reject(`LightningChartJs is not activated on the system: ${stderr}. Please reference the Quick Start Guide`);
                return;
            }
            resolve('LightningChartJs is activated on the system');
        });
    });
};

module.exports = {checkRtlSdrInstallation, checkSoxInstallation, checkFfmpegInstallation, checkLCJSVerification};