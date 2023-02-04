import pandas as pd
import os
import numpy as np
import matplotlib.pyplot as plt
from scipy import signal


def main():
    data = import_data('TestData\\mmc1.csv')
    data = data[:2000]
    time = data['Time']
    acc = data['RightACC']
    emg = data['RightEMGext']

    # Filter data
    acc_output = butter_filter(acc, 2, 30)
    emg_output = butter_filter(emg, 15, 250)

    # Display data
    fig, axs = plt.subplots(2)
    axs[0].plot(time, acc, label='actual')
    axs[0].plot(time, acc_output, label='filtered')
    axs[0].set_title('ACC')
    axs[1].plot(time, emg, label='actual')
    axs[1].plot(time, emg_output, label='filtered')
    axs[1].set_title('EMG')
    plt.show()


''' Do a bandpass filter on data with low and high being the min and max frequencies'''
def butter_filter(data, low, high):
    band_filter = signal.butter(10, [low, high], btype='bandpass', output='sos', fs=1000)
    return signal.sosfilt(band_filter, data)

''' Import a space-separated csv file into a pandas dataFrame'''
def import_data(filepath):
    directory = os.path.dirname(os.path.abspath(__file__))
    datafile = os.path.join(directory, filepath)
    data = pd.read_csv(datafile, delim_whitespace=True)
    return data

if __name__ == '__main__':
    main()


