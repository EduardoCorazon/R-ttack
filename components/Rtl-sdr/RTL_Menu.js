// perhaps add better user feedback in backend with console.log [commented them out]

const {spawn} = require('child_process');
const fs = require('fs');
const path = require('path');
const {decode} = require('wav-decoder');
const {exec} = require('child_process');

// defaults
let status = 0;
let lastItem = '0 Record';
let inputRtlSdr = 94.5;
let inputGain = 35;
let inputSampleRate = 250000;
let outputFreq = 94.5;
let demodulatorType = 'wfm';
let recordIqDirectory = '../../public/';
let recordIqFilename = 'default';
let IQCreationTime = 0;
let MP3Duration = 0;

function setCaptureSettings(frequency, sampleRate, gain, type, demodulation, fileName) {
    inputRtlSdr = frequency || inputRtlSdr;
    inputGain = gain || inputGain;
    outputFreq = frequency || outputFreq;
    inputSampleRate = sampleRate || inputSampleRate
    demodulatorType = demodulation || demodulatorType;
    recordIqFilename = fileName || recordIqFilename;
}

// For stopping recordings
function stopProcesses() {
    const rtlSdrKillProcess = spawn('sudo', ['killall', 'rtl_sdr', 'rtl_fm']);
    rtlSdrKillProcess.on('close', (code) => {
        // console.log('Killed rtl_sdr, sendiq, and rtl_fm');
    });
    // you don't need this other one (just paranoid lol)
    const rtlFmKillProcess = spawn('pkill', ['-TERM', 'rtl_fm']);
    rtlFmKillProcess.on('close', (code) => {
        // console.log('Killed rtl_fm');
    });
    status = 1;
}

// For Replay & Jamming Attacks
function stopAttacks() {
    const rtlSdrKillProcess = spawn('sudo', ['killall', 'sendiq', 'rtl_fm']);
    rtlSdrKillProcess.on('close', (code) => {
        // console.log('Killed sendiq and rtl_fm');
    });
    status = 1;
}

function updateMetadataFile(recordIqDirectoryPath, metadata) {
    const metadataFilePath = path.join(recordIqDirectoryPath, `${recordIqFilename}_metadata.json`);
    if (fs.existsSync(metadataFilePath)) {
        // If metadata file exists, read and update it
        const existingMetadata = JSON.parse(fs.readFileSync(metadataFilePath, 'utf-8'));
        existingMetadata.gain = metadata.gain;
        existingMetadata.sampleRate = metadata.sampleRate;
        existingMetadata.frequency = metadata.frequency;
        existingMetadata.creationTime = metadata.creationTime;
        existingMetadata.demodulation = metadata.demodulation;

        // If RecAnalyze was run and now RecAttack is run
        if (existingMetadata.status === 'Analyzed' && metadata.role === 'Attack Ready') {
            existingMetadata.role = 'Both';
            existingMetadata.team = 'Ready for Attack & Analyzed';
            existingMetadata.status = 'Attack & Analyzed';

            // If RecAttack was run and now RecAnalyze is run
        } else if (existingMetadata.status === 'Attack Ready' && metadata.status === 'Analyzed') {
            existingMetadata.role = 'Both';
            existingMetadata.team = 'Ready for Attack & Analyzed';
            existingMetadata.status = 'Attack & Analyzed';

            // If neither RecAnalyze nor RecAttack has been run or if the order is different
        } else {
            existingMetadata.role = metadata.role;
            existingMetadata.team = metadata.team;
            existingMetadata.status = metadata.status;
        }
        existingMetadata.actions = metadata.actions;

        fs.writeFileSync(metadataFilePath, JSON.stringify(existingMetadata, null, 2), {mode: 0o666});
        // console.log(`Metadata updated in ${metadataFilePath}`);
    } else {
        // If metadata file doesn't exist, create a new one
        fs.writeFileSync(metadataFilePath, JSON.stringify(metadata, null, 2), {mode: 0o666});
        // console.log(`Metadata saved to ${metadataFilePath}`);
    }
}

function menuAction(menuChoice) {
    lastItem = menuChoice;
    const recordIqDirectoryPath = path.join(__dirname, recordIqDirectory, recordIqFilename);
    const recordIqPath = path.join(recordIqDirectoryPath, `${recordIqFilename}.iq`);
    const recordMp3Path = path.join(recordIqDirectoryPath, `${recordIqFilename}.mp3`);
    const saveGraphFilePath = path.join(recordIqDirectoryPath, `${recordIqFilename}_audio2ch.json`);
    // create directory if it doesn't exist already
    if (!fs.existsSync(recordIqDirectoryPath)) {
        fs.mkdirSync(recordIqDirectoryPath, {recursive: true, mode: 0o777});
    }
    let captureCounter = 0;

    function generateUniqueID() {
        const timestamp = Date.now();
        const uniqueID = `${recordIqFilename}_${timestamp}_${captureCounter}`;
        captureCounter += 1;
        return uniqueID;
    }

    switch (menuChoice) {
        /*---------------------------------------------------------------------------------------------------------*/
        case 'RecAttack':
            // console.log("Calling RecAttack");
            const rtlSdrProcess = spawn('rtl_sdr', ['-s', inputSampleRate.toString(), '-g', inputGain.toString(), '-f', `${inputRtlSdr}e6`, `${recordIqPath}`]);
            rtlSdrProcess.on('error', (err) => {
                if (err) {
                    console.error(`Error in rtl_sdr process: ${err}`);
                    status = 1;
                }
            });
            rtlSdrProcess.on('close', (code) => {
                if (code === 0) {
                    // console.log('RTL-SDR recording completed successfully');
                    IQCreationTime = Date.now()
                    // console.log(IQCreationTime)
                } else {
                    console.error(`Error in rtl_sdr command. Exit code: ${code}`);
                    status = 1;
                }
            });

            // Create Metadata for Attack Mode
            const metadataAttack = {
                id: generateUniqueID(),
                name: recordIqFilename,
                age: '',
                role: 'Attack Mode',
                team: 'Attack Mode team',
                email: '',
                status: 'Attack Ready',
                actions: '',
                avatar: '', //https://i.pravatar.cc/
                demodulation: demodulatorType,
                duration: MP3Duration,
                creationTime: Date.now(),
                gain: inputGain,
                sampleRate: inputSampleRate,
                frequency: inputRtlSdr,
                filename: recordIqFilename,

            };
            updateMetadataFile(recordIqDirectoryPath, metadataAttack);
            break;

        /*---------------------------------------------------------------------------------------------------------*/

        case 'RecAnalyze':
            // console.log("calling RecAnalyze")
            const rtlFmSoxProcess = spawn(
                'rtl_fm',
                ['-g', inputGain.toString(), '-f', `${inputRtlSdr}e6`, '-M', `${demodulatorType}`, '-s', inputSampleRate.toString(), '-E', 'deemp'],
                {stdio: ['ignore', 'pipe', 'inherit']} // Redirect stdout of rtl_fm to stdin of sox
            );
            const soxProcess = spawn(
                'sox',
                ['-t', 'raw', '-r', inputSampleRate.toString(), '-e', 'signed', '-b', '16', '-c', '1', '-', '-t', 'mp3', '-C', '192', recordMp3Path],
                {stdio: ['pipe', process.stdout, process.stderr]} // Use stdout and stderr of sox directly
            );
            // Pipe the stdout of rtl_fm to stdin of sox
            rtlFmSoxProcess.stdout.pipe(soxProcess.stdin);
            rtlFmSoxProcess.on('close', (rtlFmCode) => {
                if (rtlFmCode === 0) {
                    // console.log('rtl_fm command executed successfully');
                } else {
                    console.error('Error in rtl_fm command');
                    status = 1;
                }
            });

            soxProcess.on('close', async (soxCode) => {
                if (soxCode === 0) {
                    // console.log('SoX command executed successfully');
                    IQCreationTime = Date.now()
                    const metadataAnalyze = {
                        id: generateUniqueID(),
                        name: recordIqFilename,
                        age: '',
                        role: 'Analyzer Mode',
                        team: 'Analyzer Mode team',
                        email: '',
                        status: 'Analyzed',
                        actions: '',
                        avatar: '', // https://i.pravatar.cc/
                        demodulation: demodulatorType,
                        duration: MP3Duration,
                        creationTime: IQCreationTime,
                        gain: inputGain,
                        sampleRate: inputSampleRate,
                        frequency: inputRtlSdr,
                        filename: recordIqFilename,
                        GraphFilePath: saveGraphFilePath,
                    };
                    updateMetadataFile(recordIqDirectoryPath, metadataAnalyze);
                    console.log("analyzing...")
                    // Convert to .json for graph
                    const mp3FilePath = path.join(recordIqDirectoryPath, `${recordIqFilename}.mp3`);
                    const wavFilePath = path.join(recordIqDirectoryPath, `${recordIqFilename}_converted.wav`);
                    const execPromise = (command) => new Promise((resolve, reject) => {
                        exec(command, (error) => {
                            if (error) reject(error);
                            resolve();
                        });
                    });

                    // The code below converts an audio file to a json file filled with arrays by
                    // creating sub-arrays containing volume intensity for every 0.01 second of the audio

                    // convert to wav file & convert wav to audio2.json
                    const wavData = await execPromise(`ffmpeg -y -i ${mp3FilePath} ${wavFilePath}`).then(() => fs.promises.readFile(wavFilePath));
                    const audioArrayBuffer = wavData.buffer.slice(wavData.byteOffset, wavData.byteOffset + wavData.byteLength);
                    const audioData = await decode(audioArrayBuffer);
                    const subArrayDuration = 0.1; // 0.1 seconds
                    const sampleRate = 44100;
                    const squelchThreshold = 20; // dynamically adjust in future
                    const amplificationFactor = 1.5; // dynamically adjust in future
                    // try to set normalization to center the intensity around 0
                    const normalizedAudioFrames = audioData.channelData[0].map(value => (value + 1) * 127.5);
                    const amplifiedFrames = normalizedAudioFrames.map(value => (value * amplificationFactor));
                    // Apply squelch by filtering out low-amplitude values
                    const squelchedFrames = amplifiedFrames.filter(value => value > squelchThreshold);
                    const quantize = (value, bits) => Math.round(value * ((2 ** bits) - 1) / 255);
                    const quantizedFrames = squelchedFrames.map(value => quantize(value, 8)); // set number of val per array
                    const audioFramesArray = [];
                    let frameIndex = 0;

                    const intervalId = setInterval(() => {
                        const subArrayStart = Math.floor(frameIndex * subArrayDuration * sampleRate);
                        const subArrayEnd = Math.floor((frameIndex + 1) * subArrayDuration * sampleRate);
                        // Ensure the subArrayEnd does not exceed the length of quantizedFrames
                        const slicedEnd = Math.min(subArrayEnd, quantizedFrames.length);
                        const subArray = quantizedFrames.slice(subArrayStart, slicedEnd);
                        audioFramesArray.push(subArray);
                        frameIndex++;

                        if (subArrayStart >= quantizedFrames.length) {
                            clearInterval(intervalId);
                            const jsonData = {"ch1": audioFramesArray.map(frame => [...frame])};
                            const jsonContent = JSON.stringify(jsonData, null, 2);

                            fs.writeFile(saveGraphFilePath, jsonContent, {flag: 'w'}, (err) => {
                                if (err) {
                                    console.error(`Error writing file: ${err.message}`);
                                } else {
                                    // console.log(`File written: ${saveGraphFilePath}`);
                                }
                            });
                        }
                    }, subArrayDuration * 1000);
                } else {
                    console.error('Error in SoX command');
                    status = 1;
                }
            });
            break;

        /*---------------------------------------------------------------------------------------------------------*/

        case 'ReplayAttack':
            const sendiqProcess = spawn('sudo', ['sendiq', '-s', `${inputSampleRate}`, '-f', `${inputRtlSdr}e6`, '-t', 'u8', '-i', `${recordIqPath}`]);
            sendiqProcess.on('close', (code) => {
                if (code === 0) {
                    // console.log('Replay Attack command executed successfully');
                } else {
                    console.error('Error in Replay Attack command');
                    status = 1;
                }
            });
            break;

        case 'JammingAttack':
            const fm2ssb = spawn('sh', ['-c', `rtl_fm -f ${inputRtlSdr}e6 -s 250k -r 48k -g ${inputGain} | csdr convert_i16_f | csdr fir_interpolate_cc 2 | csdr dsb_fc | csdr bandpass_fir_fft_cc 0.002 0.06 0.01 | csdr fastagc_ff | buffer | sudo sendiq -i /dev/stdin -s 96000 -f ${outputFreq}e6 -t float`]);
            fm2ssb.on('close', (code) => {
                if (code === 0) {
                    // console.log('Jamming Attack command executed successfully');
                } else {
                    console.error('Error in Jamming Attack command');
                    status = 1;
                }
            });
            break;

        default:
            status = 1;
            stopProcesses();
            break;
    }
}

module.exports = {
    menuAction,
    stopProcesses,
    stopAttacks,
    setCaptureSettings,
    getLastItem: () => lastItem,
};