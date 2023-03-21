import pandas as pd

import os
import numpy as np
import matplotlib.pyplot as plt
from scipy import signal

def main():
    # Import and slice the data
    data = import_data('TestData\mmc1.csv')[:3000]
    time = data['Time']
    acc = data['RightACC'].abs()
    emg = data['RightEMGflex']
    # Filter data
    emg_Filtered = butter_filter(emg, 4, 20, 400)
    acc_Filtered = butter_filter(acc, 2, 0.5, 20)

    # Compute the hilbert transform and emg envelope
    emg_envelope = np.abs(signal.hilbert(emg_Filtered))
    emg_detrend = signal.detrend(emg_envelope, type='constant')

    # Compute the power spectral density (PSD) using welch's blackman method.
    # The number of segments is defined as 256, which is the closest power of 2 to 1/3 of the sample frequency
    f1, Pxx_emg = signal.welch(emg_detrend, fs=1000, nperseg=256, window='blackman')
    f2, Pxx_acc = signal.welch(acc_Filtered, fs=1000, nperseg=256, window='blackman')

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


if __name__ == '__main__':
    main()