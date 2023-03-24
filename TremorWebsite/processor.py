from datetime import datetime
import os
import numpy as np
from scipy import signal
import pandas as pd


def start_processing(db, userID, key):
    # Separates the current data csv into separate arrays for the raw data
    filepath = 'data\data.csv'
    directory = os.path.dirname(__file__)
    datafile = os.path.join(directory, filepath)
    data = pd.read_csv(datafile, delimiter=',')
    acc = data['IMU'][key-1000:key]
    emg = data['EMG'][key-1000:key]

    # Records the time stamp when processing starts, and calls the processing chunk function
    timeStamp = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
    result = processingFunc(acc, emg)
    print(result)
    # appends the resulting data and timestamp into the firebase
    db.child('users').child(userID).child('data').update({timeStamp: result})
    return  # return nothing, terminates the thread


def processingFunc(emg, acc):

    emg_Filtered = butter_filter(emg, 4, 20, 400)
    acc_Filtered = butter_filter(acc, 2, 0.5, 20)

    # Compute the hilbert transform and emg envelope
    emgHilbert = signal.hilbert(emg_Filtered)
    emg_envelope = np.abs(emgHilbert)
    emg_detrend = signal.detrend(emg_envelope, type='constant')

    # Compute the power spectral density (PSD) using welch's blackman method.
    # The number of segments is defined as 256, which is the closest power of 2 to 1/3 of the sample frequency
    f1, Pxx_emg = signal.welch(
        emg_detrend, fs=1000, nperseg=256, window='blackman')
    f2, Pxx_acc = signal.welch(
        acc_Filtered, fs=1000, nperseg=256, window='blackman')

    # Calculate the frequency with the highest power in the EMG PSD
    f_max_emg = f1[np.argmax(Pxx_emg)]

    # Calculate the frequency with the highest power in the Accelerometer PSD
    f_max_acc = f2[np.argmax(Pxx_acc)]

    tremorDominantFrequency = float(f_max_emg + f_max_acc)/2.0

    return tremorDominantFrequency


''' Do a bandpass filter on data with low and high being the min and max frequencies'''


def butter_filter(data, order, low, high):
    b, a = signal.butter(
        order, [low, high], btype='band', output='ba', fs=1000, analog=False)
    return signal.filtfilt(b, a, data, method="gust")


if __name__ == "__main__":
    start_processing()
