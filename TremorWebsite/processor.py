from datetime import datetime
import os
import numpy as np
from scipy import signal
import pandas as pd
import math


def start_processing(emg, acc, freq, db, userID, key):

    print(emg[:100])
    print(acc[:100])

    # Records the time stamp when processing starts, and calls the processing chunk function
    timeStamp = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
    result_freq, result_power = processingFunc(acc, emg, freq)
    # appends the resulting data and timestamp into the firebase
    db.child('users').child(userID).child('data').child('frequency').update({timeStamp: result_freq})
    db.child('users').child(userID).child('data').child('power').update({timeStamp: result_power})
    return  # return nothing, terminates the thread


def processingFunc(emg, acc, freq):

    emg_Filtered = butter_filter(emg, 4, 20, 0.4*freq,freq)
    acc_Filtered = butter_filter(acc, 2, 0.5, 20,freq)

    print(emg_Filtered[:100])
    print(acc_Filtered[:100])

    # Compute the hilbert transform and emg envelope
    emgHilbert = signal.hilbert(emg_Filtered)
    emg_envelope = np.abs(emgHilbert)
    emg_detrend = signal.detrend(emg_envelope, type='constant')

    # Calculates the number of segments, which is the closest power of 2 to 1/3 of the sample frequency
    numseg = closest_power_of_two(freq)
    

    # Compute the power spectral density (PSD) using welch's blackman method and the number of segments defined above
    f1, Pxx_emg = signal.welch(
        emg_detrend, fs=freq, nperseg=numseg, window='blackman')
    f2, Pxx_acc = signal.welch(
        acc_Filtered, fs=freq, nperseg=numseg, window='blackman')

    #calculates the frequency resolution
    freqRes = float(freq/numseg)

    #finds the power of the nearest bins(segments) in the FFT for EMG and ACC
    accMaxPower = Pxx_acc[np.argmax(Pxx_acc)]
    accPowerNext =  Pxx_acc[np.argmax(Pxx_acc)+1]
    accPowerPrev = Pxx_acc[np.argmax(Pxx_acc)-1]

    emgMaxPower = Pxx_emg[np.argmax(Pxx_emg)]
    emgPowerNext = Pxx_emg[np.argmax(Pxx_emg)+1]
    emgPowerPrev = Pxx_emg[np.argmax(Pxx_emg)-1]

    #calculates the deviation of the true maximum from the max bin in the FFT using gaussian interpolation
    accDevNumer = float(math.log(accPowerNext/accPowerPrev))
    accDevDenom = 2*float(math.log((accMaxPower*accMaxPower)/(accPowerPrev*accPowerNext)))
    accDeviation = np.argmax(Pxx_acc) + float(accDevNumer/accDevDenom)

    emgDevNumer = float(math.log(emgPowerNext/emgPowerPrev))
    emgDevDenom = 2*float(math.log((emgMaxPower*emgMaxPower)/(emgPowerPrev*emgPowerNext)))
    emgDeviation = np.argmax(Pxx_emg) + float(emgDevNumer/emgDevDenom)

    #calculates the true max input frequency for ACC and EMG
    trueMaxFreqACC = accDeviation * freqRes
    trueMaxFreqEMG = emgDeviation * freqRes

    #Takes the average of the EMG and ACC frequencies/powers
    tremorDominantFrequency = float(trueMaxFreqACC + trueMaxFreqEMG)/2.0
    tremorDominantPower = float(accMaxPower + emgMaxPower)/2.0

    return tremorDominantFrequency,tremorDominantPower


''' Do a bandpass filter on data with low and high being the min and max frequencies'''


def butter_filter(data, order, low, high,freq):
    b, a = signal.butter(
        order, [low, high], btype='band', output='ba', fs=freq, analog=False)
    return signal.filtfilt(b, a, data, method="gust")


def closest_power_of_two(freq):
    freq = freq / 3  # redefine freq as freq/3
    # Find the closest power of two greater than or equal to freq
    closestPow = 2**math.ceil(math.log(freq, 2))

    # Find the closest power of two less than or equal to freq
    closestPowPrev = closestPow // 2

    # Return the closest power of two
    if abs(freq - closestPow) < abs(freq - closestPowPrev):
        return closestPow
    else:
        return closestPowPrev

if __name__ == "__main__":
    start_processing([12,34,25,346,65,34,65,34,65,34]*300, [9.86, 9.95, 9.95, 9.95, 9.98, 9.98, 9.98, 10.08, 10.08, 10.13, 10.12, 10.12, 10.07, 10.07, 10.07, 10.11, 10.11, 10.11, 10.03, 10.03, 10.11, 10.11, 10.11, 10.07, 10.07, 10.07, 10.06, 10.06, 10.04, 10.04, 10.04, 10.06, 10.06, 10.06, 10.07, 10.07, 10.04, 10.04, 10.04, 10.05, 10.05, 10.05, 10.07, 10.07, 10.05, 10.05, 10.05, 10.07, 10.07, 10.07, 10.07, 10.07, 10.07, 10.07, 10.07, 10.09, 10.09, 10.09, 10.0, 10.0, 10.05, 10.06, 10.06, 10.06, 10.06, 10.06, 10.05, 10.05, 10.05, 10.05, 10.05, 10.08, 10.08, 10.08, 10.05, 10.05, 10.05, 10.05, 10.05, 10.05, 10.05, 10.05, 10.07, 10.07, 
10.07, 10.06, 10.06, 10.06, 10.06, 10.06, 10.06, 10.06, 10.06, 10.08, 10.08, 10.07, 10.07, 10.07, 10.03, 10.03]*30, 'db', 'userID', 'key')
