# ODAG Variable

ODAG Variable is a Qlik Sense extension which peforms a partial reload before sending an ODAG request. This allows an end user to set a variable in the front end and load it into an inline table within the selection app load script before sending the value(s) of that inline table to the template app.

## Important Information
>This extension code requires packing using the qExt tools. You can NOT download the repo and directly install. To get the correct approved version download from the releases page (file: odag-variable.zip) and install directly into Qlik Sense.

* [GitHub releases page](https://github.com/rileymd88/odag-variable/releases)

Only developers need to use qExt
* [qExt](https://github.com/axisgroup/qExt)

## Features in BETA v0.1
* Ability to send create, refresh and delete ODAG requests
* Ability to perform a partial reload before sending ODAG request

## Example of How to Use the Extension
* Step 1: Create a new selection App. For this example I am loading data pulled from Twitter related to three Bundesliga teams.
![Step 1](https://raw.githubusercontent.com/rileymd88/data/master/odag-variable/Step1.PNG)

* Step 2: Create 2 variables within the new selection app one called "vSearchTerm" and another called "vSearchTerm2" with a definition of =Chr(39)&vSearchTerm&Chr(39)
![Step 2](https://raw.githubusercontent.com/rileymd88/data/master/odag-variable/Step2.PNG)

* Step 3: Still within the selection app, add a variable input and bind it to the variable we just created.
![Step 3](https://raw.githubusercontent.com/rileymd88/data/master/odag-variable/Step3.PNG)

* Step 4: Now create the template app. In my script you can see on lines 21-23 I am recieving the bindings for the FIELD vSearchTerm and then modifying it slightly to work with a wildmatch clause in our Qlik script.
![Step 4](https://raw.githubusercontent.com/rileymd88/data/master/odag-variable/Step4.PNG)
![Step 4](https://raw.githubusercontent.com/rileymd88/data/master/odag-variable/Step5.PNG)

* Step 5: Now go back to our selection app that we created in Step 1. We will now need to create the on-demand navigation link.
![Step 5](https://raw.githubusercontent.com/rileymd88/data/master/odag-variable/Step6.PNG)

* Step 6: Still within the selection app, find the odag-variable extension and add it to your sheet and within the extension properties select the link you just created in Step 5.
![Step 6](https://raw.githubusercontent.com/rileymd88/data/master/odag-variable/Step7.PNG)

### This step is important to understand how this extension works!
* Step 7: Still within the selection app, go do the data load script editor and add inline table found from lines 31-36. In the lines 31-36 I am first retrieving the "vSearchTerm" variable that I created in Step 2 to use it in the script and then loading that single value into a table with a FIELD named vSearchTerm. I also use here the REPLACE notation to ensure that this inline table will only be loaded when a partial reload is peformed. The odag-variable extension simply performs a partial reload before sending an ODAG request so that the variable in the front end will be loaded into an inline table and then this value will be passed onto our template app and we can use the normal ODAG bindings to get the values of this new "field" which contains the value of the variable.
![Step 7](https://raw.githubusercontent.com/rileymd88/data/master/odag-variable/Step8.PNG)

* Step 8: Now you can click on the button within the extension and click on Generate New App (this button will only show when your link condition has been met).
![Step 8](https://raw.githubusercontent.com/rileymd88/data/master/odag-variable/Step9.PNG)
![Step 8](https://raw.githubusercontent.com/rileymd88/data/master/odag-variable/Step10.PNG)

* Step 9: Click on the sheet icon to open the newly generated app. If all goes well within your newly created app you should only see the tweets related to the variable you input before hitting Generate New App.
![Step 9](https://raw.githubusercontent.com/rileymd88/data/master/odag-variable/Step11.PNG)




