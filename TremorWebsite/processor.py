import multiprocessing
from multiprocessing import Pool
from datetime import datetime
import pandas as pd
import numpy as np

def start_processing(db, userID):
    # Chunk data
    cores = 1
    df = pd.read_csv('TremorWebsite\data\data.csv')
    column = df.loc[:, ['EMG','IMU']]
    chunks = np.array_split(column, cores)
    arrays = [chunk.to_numpy() for chunk in chunks]

    # Process with multiprocessing
    with Pool() as pool:
        result = pool.map(process_chunk, arrays)
    timeStamp = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
    db.child('users').child(userID).child('data').update({timeStamp:np.average(result)})
    
    
    

def process_chunk(arr):
    avg= np.average(arr)
    return avg

if __name__ == "__main__":
    start_processing()
