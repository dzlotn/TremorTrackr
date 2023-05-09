from datetime import datetime
import os
import numpy as np
from scipy import signal
import pandas as pd
import math


def start_processing(emg, acc, db, userID, key):

    freq = 1000

    # Separates the current data csv into separate arrays for the raw data
    # filepath = 'data\data.csv'
    # directory = os.path.dirname(__file__)
    # datafile = os.path.join(directory, filepath)
    # data = pd.read_csv(datafile, delimiter=',')
    # acc = data['IMU'][key-1000:key]
    # emg = data['EMG'][key-1000:key]

    # Records the time stamp when processing starts, and calls the processing chunk function
    timeStamp = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
    result_freq, result_power = processingFunc(acc, emg, freq)
    # appends the resulting data and timestamp into the firebase
    db.child('users').child(userID).child('data').child('frequency').update({timeStamp: result_freq})
    db.child('users').child(userID).child('data').child('power').update({timeStamp: result_power})
    return  # return nothing, terminates the thread


def processingFunc(emg, acc, freq):

    emg_Filtered = butter_filter(emg, 4, 20, 400,freq)
    acc_Filtered = butter_filter(acc, 2, 0.5, 20,freq)

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

    # Calculate the frequency with the highest power in the EMG PSD
    f_max_emg = f1[np.argmax(Pxx_emg)]

    # Calculate the frequency with the highest power in the Accelerometer PSD
    f_max_acc = f2[np.argmax(Pxx_acc)]

    tremorDominantFrequency = float(f_max_emg + f_max_acc)/2.0
    averagePower = float(Pxx_emg[np.argmax(Pxx_emg)]+ Pxx_acc[np.argmax(Pxx_acc)])/2.0

    return tremorDominantFrequency, averagePower


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
    start_processing()
