# Flight Info

## To start backend server
Run `nx serve backend` 

This will start the backend server at `http://localhost:3333/api/`

Flight service is running at `http://localhost:3333/api/flights`

## To start frontend
Run `nx serve frontend` 

Frontend will start at `http://localhost:4200/`

To fetch the merged data click on "Get Flights"

## How does merging work?

1. Build a dictionary where key is the (flight number + departure time) of departing flight + (flight number + departure time) of arriving flight 

2. Create an empty result list

3. Loop through the merged data from all sources.
    
    * Check if the key exists in the dictionary. If not add it to the dictionary and add the slice to the result list.
    * If key found, then it is a duplicate. Continue.
4. Return the result list

## How to maintain a response time of less than 1 sec?

1. Caching : If data is successfully fetched from all sources within 1 sec, then add it to cache. Cache is valid  for 1 hour, so for any new request within this time frame , result is directly retirieved from cache.

2. Timeout for GET request to each source is set to 500 ms. So if any source fails or replies after 500 ms, that source result is excluded from the final merged result.

3. Cache is only set when the data is received from all sources to provide user with maximum information.
