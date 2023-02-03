import pandas as pd
import os
import numpy as np
import matplotlib.pyplot as plt
from scipy import signal



def main():
    data = import_data('TestData\\mmc1.csv')
    fs=1000
    signalc = data.iloc[:,2]
    t = data.iloc[:,0]
    fc = 30  # Cut-off frequency of the filter
    w = fc / (fs / 2) # Normalize the frequency
    plt.plot(t, signalc, label='actual')

    b2, a2 = signal.butter(10, 0.02, 'high')
    outputhigh = signal.filtfilt(b2, a2, signalc)


    plt.plot(t, outputhigh, label='highpass')


    b, a = signal.butter(10, w, 'low')
    outputlow = signal.filtfilt(b, a, signalc)
    plt.plot(t, outputlow, label='lowpass')


    

    plt.legend()
    plt.show()
    

def import_data(filepath):
    directory = os.path.dirname(os.path.abspath(__file__))
    datafile = os.path.join(directory, filepath)
    data = pd.read_csv(datafile, delim_whitespace=True)
    return data

if __name__ == '__main__':
    main()


