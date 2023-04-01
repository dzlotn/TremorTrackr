import pandas as pd

import os
import numpy as np
import matplotlib.pyplot as plt
from scipy import signal
import math

def dataProcessing():
    # Import and slice the data
    freq = 1000
    data = import_data('TestData\mmc1.csv')
    time = data['Time']
    acc = data['RightACC'].abs()
    emg = data['RightEMGext']
    # Filter data
    emg_Filtered = butter_filter(emg, 4, 20, 400)
    acc_Filtered = butter_filter(acc, 2, 0.5, 20)

    # Compute the hilbert transform and emg envelope
    emg_envelope = np.abs(signal.hilbert(emg_Filtered))
    emg_detrend = signal.detrend(emg_envelope, type='constant')

    # Calculates the number of segments, which is the closest power of 2 to 1/3 of the sample frequency
    numseg = closest_power_of_two(freq)
    
    # Compute the power spectral density (PSD) using welch's blackman method and the number of segments defined above
    f1, Pxx_emg = signal.welch(emg_detrend, fs=freq, nperseg=numseg, window='blackman')
    f2, Pxx_acc = signal.welch(acc_Filtered, fs=freq, nperseg=numseg, window='blackman')


    # Calculate the frequency with the highest power in the EMG PSD
    f_max_emg = f1[np.argmax(Pxx_emg)]
    
    # Calculate the frequency with the highest power in the Accelerometer PSD
    f_max_acc = f2[np.argmax(Pxx_acc)]

    # Plot the PSDs using different methods
    plt.semilogy(f1, Pxx_emg, label='EMG')
    plt.semilogy(f2, Pxx_acc, label='Accelerometer')

    # Add a vertical line to indicate the frequency with the highest power for EMG
    plt.axvline(x=f_max_emg, color='r', linestyle='--', label=f'Max EMG frequency: {f_max_emg:.2f} Hz')
    
    # Add a vertical line to indicate the frequency with the highest power for Accelerometer
    plt.axvline(x=f_max_acc, color='b', linestyle='--', label=f'Max Accelerometer frequency: {f_max_acc:.2f} Hz')

    # Set the plot title and labels
    plt.title('Power Spectral Density')
    plt.xlabel('Frequency (Hz)')
    plt.ylabel('Power/Frequency (dB/Hz)')

    # Add a legend to differentiate between the signals and the max frequency lines
    plt.legend()
    plt.show()
    return [f_max_emg,f_max_acc]


''' Do a bandpass filter on data with low and high being the min and max frequencies'''
def butter_filter(data, order, low, high):
    b,a = signal.butter(order, [low, high], btype='band', output='ba', fs=1000, analog=False)
    return signal.filtfilt(b,a, data, method="gust")


''' Import a space-separated csv file into a pandas dataFrame'''
def import_data(filepath):
    directory = os.path.dirname(os.path.abspath(__file__))
    datafile = os.path.join(directory, filepath)
    data = pd.read_csv(datafile, delimiter=',')
    return data

def closest_power_of_two(freq):
    freq = freq / 3  # redefine freq as freq/3
    # Find the closest power of two greater than or equal to freq
    closest_power = 2**math.ceil(math.log(freq, 2))
    
    # Find the closest power of two less than or equal to freq
    closest_power_prev = closest_power // 2
    
    # Return the closest power of two
    if abs(freq - closest_power) < abs(freq - closest_power_prev):
        return closest_power
    else:
        return closest_power_prev

if __name__ == '__main__':
    dataProcessing()