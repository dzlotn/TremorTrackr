import pandas as pd
import os
import numpy as np
import matplotlib.pyplot as plt
from scipy import signal



def main():
    data = import_data('TestData\\mmc1.csv')
    emgFlexor = [10,12,35,28,38,12,42]
    a = np.linspace(0,1,1000)
    signala = np.sin(2*np.pi*100*a) # with frequency of 100
    plt.plot(signala)

def import_data(filepath):
    directory = os.path.dirname(os.path.abspath(__file__))
    datafile = os.path.join(directory, filepath)
    data = pd.read_csv(datafile, delim_whitespace=True)
    return data

if __name__ == '__main__':
    main()


