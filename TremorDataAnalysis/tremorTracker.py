import pandas as pd
import os
import numpy as np
import matplotlib.pyplot as plt
from scipy import signal
from scipy.fft import rfft, rfftfreq


def main():
    data = import_data('TestData\\mmc1.csv')
    data = data[:10000]
    time = data['Time']
    acc = data['RightACC']
    emg = data['RightEMGflex']

    # Filter data
    acc_output = rfft(butter_filter(acc, 2, 30))
    emg_output = (np.absolute(butter_filter(emg, 5,250)))

    
   
    
    xf = rfftfreq(10000, 1 / 1000)
    import matplotlib.pyplot as plt
    # plt.plot(xf, np.abs(emg_output))



    # Display data
    fig, axs = plt.subplots(2)
    axs[0].plot(time, emg_output, label='emg')
    axs[0].set_title('EMG')
    axs[1].plot(xf, np.abs(acc_output), label='acc')
    axs[1].set_title('ACC')
    plt.show()
    print(emg_output)


''' Do a bandpass filter on data with low and high being the min and max frequencies'''
def butter_filter(data, low, high):
    band_filter = signal.butter(10, [low, high], btype='bandpass', output='sos', fs=1000)
    return signal.sosfilt(band_filter, data)

def ellip_filter(data, low):
    band_filter = signal.ellip(2, 0.5, 40,low, btype='lowpass',  output='sos', fs=1000 )
    return signal.sosfilt(band_filter, data)
''' Import a space-separated csv file into a pandas dataFrame'''
    
def import_data(filepath):
    directory = os.path.dirname(os.path.abspath(__file__))
    datafile = os.path.join(directory, filepath)
    data = pd.read_csv(datafile, delim_whitespace=True)
    return data

if __name__ == '__main__':
    main()


