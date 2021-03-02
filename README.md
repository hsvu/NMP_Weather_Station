# Weather Station

## Background
On-track weather data is important to collect, as it allows vehicle data to be analysed in the context of external environmental variables. For example, determining how much wind velocity impacts the aerodynamics, determining what levels of precipitation cause the car to hydroplane, or how track temperatures affect tyre performance. 

However, viewing a stream of continuous raw data on a terminal is not very useful. Hence, after the hardware to collect this raw numerical data is set up, the data stream must be processed appropriately and displayed on a frontend. 

## Task 1 - Backend
You will be given a module *weather_output.js* which contains a function, *generate_weather_data*, that emulates the data output from a weather station by returning an object with the following data points:

 - Ambient Temperature
 - Track Temperature
 - Humidity
 - Precipitation
 - Wind Speed
 - Wind Direction

You must not change *weather_output.js* - instead, import the function into your program and call it in a timed loop to continuously receive data. The emulated data will have errors (see the comment in *weather_output.js*), so some validation of this raw data in your backend is required. Then you must stream this data to a server. This data must then be made available to the user interface.

A skeleton server will be provided written in Typescript / Node.js so you can get used to the Redback tech stack. All these features do not have to be excessively complex or optimised - a simple, functional solution is enough (however feel free to polish things up!).

After this is completed, write some basic documentation (approx. 1-2 pages, .md or .pdf format) outlining how your application works.

## Task 2 - User Interface
The Redback engineers in the garage need to see live data from the weather station to help them understand the data from the car.

You will be given a skeleton React.js + Typescript project where you will create widgets to display the data from the weather station. Feel free to be as creative as you would like!

As a bonus you could also create widgets to show things like a live rainfall radar from a free weather API.

<p align="center">
  <img src="example-UI.png" />
</p>
</br>


## Running the code
First install the libraries needed by running 
```bash
npm install
```
You can test the code by running 
```bash
npm test
```
## Submission
Fork the given git repository, and then add all your code and documentation to this repository. You will be working with the advanced cloud project as they are tasked with deploying your app!