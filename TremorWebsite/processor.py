import multiprocessing
from multiprocessing import Pool
import time
import pandas as pd
import numpy as np

def start_processing():
    # Chunk data
    cores = 9
    df = pd.read_csv('TremorWebsite\data\data.csv')
    column = df.loc[:, ['EMG','IMU']]
    chunks = np.array_split(column, cores)
    arrays = [chunk.to_numpy() for chunk in chunks]

    # Process with multiprocessing
    with Pool() as pool:
      result = pool.map(process_chunk, arrays)
    


    print(result)
    return sum(result)

def process_chunk(arr):
    for i in range(100000000):
       avg= np.average(arr)
    return avg

if __name__ == "__main__":
    start_processing()
