# Alexa Skill Starter Template - Basic

This starter template allows you to quickly build an Alexa custom skill that has the following features:
- All translatable text is in a single file in S3 with fallback to a local copy
- Content and translations can be added or changed in S3 without redeploying the Lambda function
- Shows how you can use the same core code to get a new random item (fact) or look it up by its number
- Saves user-specific information in DynamoDB
- Uses a fork of the Alexa Skills Kit (version 1.0.6) and adds integration with Mobile Analytics
- Shows how to respond with a :tell or :ask based on whether the request was a full intent or not
- Shows the use Lodash and other libraries
- Shows debugging a skill locally

It makes use of the following Amazon Web Services:
- Identity and Access Management (IAM)
- Lambda
- DynamoDB
- Simple Storage Service (S3)
- Mobile Analytics
- CloudWatch

## Create a new project based on the Starter Kit
Clone this repo into a new project folder (ex: skill-fact-teller).

```bash
$ git clone https://github.com/rmtuckerphx/skill-starter-basic.git skill-fact-teller
$ cd skill-fact-teller
```

If you just want to start a new project without any commit history then use:

```bash
$ git clone --depth=1 https://github.com/rmtuckerphx/skill-starter-basic.git skill-fact-teller
$ cd skill-fact-teller
```

## Get node dependencies
The **src** and **test** folders each have different node dependencies so you will need to run **npm install** for each folder:
```bash
cd src
npm install

cd test
npm install
```

## Add role to IAM and create user to debug locally
The first thing that needs to be configured in Amazon is IAM:
- Go to the [IAM console](https://console.aws.amazon.com/iam/home#roles)
- Click **Create New Role** button
- Give your role a name. ex: *factTellerSkillRole*
- Add the following policies:
  - CloudWatchFullAccess
  - AmazonDynamoDBFullAccess
  - AmazonS3ReadOnlyAccess
  - AmazonMobileAnalyticsWriteOnlyAccess      
- Click on the **Users** tab
- Click the **Create New Users** button
- Go to the [Debugging AWS Lambda Code Locally](https://developer.amazon.com/public/community/post/Tx24Z2QZP5RRTG1/New-Alexa-Technical-Tutorial-Debugging-AWS-Lambda-Code-Locally) tutorial
- Follow the steps from the article in the following sections using your role name instead of **lambda_dynamo**
  - Create a new user in AWS IAM
  - Record your AWS Keys
  - Saving the User ARN value
  - Grant the user Assume Role access to the role defined for your skill
  - Configure the AWS Keys for your environment

## Create Alexa skill in developer portal
Creating an Alexa skill has two main parts: 1) the skill created in the developer portal and 2) the skill code created in Lambda. Here are the initial steps of the first part: 
- Go to the [Amazon Developer Console](https://developer.amazon.com/home.html)
- Click the **ALEXA** tab
- Click the **Get Started** button in the **Alexa Skills Kit** section
- Click the **Add a New Skill** button
- Select **Custom Interaction Model**
- Give your skill a **Name**. ex: *factTeller*
- Give your skill an **Invocation Name**. ex: *fact teller*
- Click **Save**. This generates an Application Id. 
- Copy the **Application Id** and put it in the **scr\constants.json** file as the value for key: **skillAppID**
- Click **Next**
- For the **Intent Schema**, copy and paste the contents of the **speechAssets\IntentSchema.json** file
- For the **Sample Utterances**, copy and paste the contents of the **speechAssets\SampleUtterances.txt** file
- Click **Save**

We will continue the configuration after we upload the skill the AWS Lambda.

## Debug the Skill Locally
At this point you should be able to debug your skill locally.

This starter template is setup for [Visual Studio Code](http://code.visualstudio.com/) as your editor as it was simple to setup debugging.
If you choose a different editor, you can delete the .vscode folder in your project tree.

- Check **test\main.js** to see which of the events is uncommented. (only uncomment one event at a time). Should be initiall set to **LaunchRequest.json**
- In **src\index.js**, set a breakpoint inside the **LaunchRequest** handler. (see line 34)
- In VS Code, click the **Debug** tab.
- Click the green start debugging arrow (or use the F5 key)
- The debugger will stop on your breakpoint so you can step through code.
- Hit the **F5** key to continue.
- Open the **Debug Console** if it is not already visible.

You should see something similar to this in the **Debug Console**:

```
node --debug-brk=25297 --nolazy test\main.js 
Debugger listening on port 25297
Translations - Use local resources.
context.succeed
{ version: '1.0',
  response: 
   { outputSpeech: 
      { type: 'SSML',
        ssml: '<speak> Skill Name can share facts and maybe do other things.  For more details, say help. So, what would you like? </speak>' },
     shouldEndSession: false,
     reprompt: { outputSpeech: [Object] } },
  sessionAttributes: 
   { speechOutput: 'Skill Name can share facts and maybe do other things.  For more details, say help. So, what would you like?',
     repromptSpeech: 'What can I tell you about?' } }
```


## Setting source location for Translations
This starter template puts all translations into a **translations.json** file. This file can be accessed locally or put in S3 so that it can be updated without redeploying code.


### Use During Local testing


Notice line 12 of **src\index.js**. It sets **useLocalResources** to the debug value of the incoming request. This value does not exist for real requests. It has been manually added to all json files in **test\requests**.
The idea is that during local testing, the developer could setup the sample requests to either use the local translations or the ones hosted in S3. 


### Host Locally

If you always want the translations to be hosted locally (not use S3 at all). Then uncomment out line 13 so that **useLocalResource** is always **true**.


### Host in S3

Using S3 as the location for translations allows the translations to be changed or new content added without needing to update or redeploy code.

If there is ever an error accessing S3, then the **translations.json** file included with the Lambda function will be used as a fallback. If newer content is included in the **translations.json** file on S3, then it will not be available during the fallback.
The **translations.js** file caches the translations resources the first time they are accessed either locally or from S3. This minimizes the number of calls to S3 as the same translations will be used no matter how many requests the Lambda function handles.

You can use the same S3 bucket to host audio files used in Speech Synthesis Markup Language (SSML) or images used in cards.

To host the translations.json file in S3, you need to create a bucket and key and set the values in the constants.json file.

- Go to the [S3 console](https://console.aws.amazon.com/s3/home?region=us-east-1)
- Create a bucket in the **US Standard region**. ex: *skill-fact-teller*
- Click **Upload** from the **Actions** dropdown.
- Click **Add Files** and select the **translations.json** file
- Click the **Set Details** button at the bottom right of the **Upload** dialog
- Select **Use Standard Storage**
- Click **Set Permissions** button
- Click **Add more permissions**
- Enter **Authenticated Users** for Grantee and check **View Permissions**
- Click **Start Upload** button
- Change the bucketName in **src\constants.json** to match the name of the bucket

## Test Getting Values from S3
Let's make sure we can get values from S3:
- Make sure that line 13 in **src\index.js** is commented out and that **useLocalResources** is set to the debug value.
- Look in **test\main.js** to determine which test request is set. ex: **test\requests\LaunchRequest.json**
- Temporarily change **request.debug** value in the file to **false**
- Debug the skill locally (see section **Debug the Skill Locally**)

The **Debug Console** should include a log statment as follows:

```
Translations - Successful get of resources from S3: skill-fact-teller, translations.json
```

## Save User Data to DynamoDB
It is quick to setup DynamoDB use:
- In **src\constants.json**, set the name of **dynamoDBTableName** to what you want: *skillFactTellerUsers*
- In **src\index.js**, uncomment line 20 and then run a local request to your skill. You should see something similar to the following in the Debug Console:

```
Creating table skillFactTellerUsers:
{"TableDescription":{"AttributeDefinitions":[{"AttributeName":"userId","AttributeType":"S"}],"TableName":"skillFactTellerUsers","KeySchema":[{"AttributeName":"userId","KeyType":"HASH"}],"TableStatus":"CREATING","CreationDateTime":"2016-11-05T21:12:01.008Z","ProvisionedThroughput":{"NumberOfDecreasesToday":0,"ReadCapacityUnits":5,"WriteCapacityUnits":5},"TableSizeBytes":0,"ItemCount":0,"TableArn":"arn:aws:dynamodb:us-east-1:999999999:table/skillFactTellerUsers"}}
```

- Go to the [DynamoDB console](https://console.aws.amazon.com/dynamodb/home)
- Click on **Tables** and then the name of your table then the **Items** tab. You will notice that there are no rows in the table. A skill only writes to the table when you emit a *:tell* or *:saveState*.  
- Change **test/main.js** so that the only event being included is: **test/requests/AMAZON.StopIntent.json** and run the skill locally. This test uses *:tell*
- Check back in the **DynamoDB console**, and you will see a row in the table as follows:

  ```json
  {
    "mapAttr": {
      "repromptSpeech": " ",
      "speechOutput": " "
    },
    "userId": "amzn1.ask.account.testaccount1"
  }
  ```

## Enable Mobile Analytics
You can quickly enable Mobile Analytics with a single setting and all requests to your skill will automatically be tracked:
- Go to the [Mobile Analytics console](https://console.aws.amazon.com/mobileanalytics/home/)
- Add an app and set the **App Name**. ex: *skillFactTeller*
- Click the **Create App** button
- Go to the **Manage Apps** screen and copy the **App ID** to the **mobileAnalyticsSettings.appId** value in **src\constants.json**.
- The only other entry that is required is the **mobileAnalyticsSettings.appTitle** and that can be whatever string you want. ex: *skillFactTeller*
- Uncomment out line 21 of **src\index.js** so that mobile analytics is enabled.
- Run the code locally again and you will see the following log entries in the **Debug Console**:

  ```
  Mobile Analytics - Start Session: SessionId.Session1
  Mobile Analytics - Create Event: _session.start, SessionId.Session1
  Mobile Analytics - Create Event: AMAZON.StopIntent, SessionId.Session1
  Mobile Analytics - Successful putEvents.
  ```
It might take 30 minutes to an hour, but go back to the [Mobile Analy and you will see your tracked request.


## Create the Lambda function

All that we have done so far is running the skill locally. Now it is time to create the Lambda function.

Before we upload the code to Lambda, we need to zip the entire contents (including **node_modules** folder) of the **src** folder into a zip file: **src.zip**

Now we are ready:
- Go to the [Lambda console](https://console.aws.amazon.com/lambda/home)
- Click **Create a Lambda function** button
- Filter the list by **Node.js 4.3** and **"alexa"** and then pick the **alexa-skills-kit-color-expert** template
- Configure the trigger as **Alexa Skills Kit** and click **Next**
- Enter values for **Name** (ex: *skillFactTeller*) and **Runtime** (ex: *Node.js 4.3*)
- Make sure role is set to **Choose an existing role**
- From the **Existing role** dropdown, pick the role created at the beginning of these instructions. ex: *factTellerSkillRole*
- Leave the remaining settings unchanged.
- Click **Next** button.
- Click **Create function** button.
- Click on the **Code** tab, change the **Code entry type** to **Upload a .ZIP file**
- Click the **Upload** button and select the zip file and then click the **Save** button.
- Click the **Test** button and on the dialog, find the entry named **Alexa Start Session**.
- The template looks just like the sample request files that we have been using to test locally.
- Click the **Save and test** button.
- If you get an error message that says **"Invalid ApplicationId"** then copy the application Id that is shown and from the **Actions** menu, select **Configure Test event**.
- Change the **applicationId** in the template to the one just copied.
- Click the **Save and test** button.
- If you get an error message that says **"Error fetching user state: ValidationException: The provided key element does not match the schema"** check the template again and make sure that the **userId** is not null. Set it to any string (ex: *lambda-test1*). 
- Click the **Save and test** button.
- You will see a green check mark for a successful execution and the response will be shown similar to what was shown in the **Debug Console** when executing locally.
- Notice that the **Log output** section of this screen shows the same console log statements found in the **Debug Console** when executing locally.

## Use CloudWatch to see your logs
CloudWatch is already configured without any additonal work on our part:
- Go to the [CloudWatch console](https://console.aws.amazon.com/cloudwatch/home) or click the **Click here** link found in the Lambda console in the **Log output** section.
- Click the **Logs** item in the side menu
- Click the name of your Lambda function listed in the **Log Groups** column.
- Click a **Log Stream** entry
- Notice that each request to the Lambda function associated with your skill logs a **START, END, and REPORT** row plus a row for any console log statements.


## View Tracking in Mobile Analytics
If enough time has passed, you will see all requests to your skill begin tracked in Mobile Analytics:
- Go to the [Mobile Analytics console](https://console.aws.amazon.com/mobileanalytics/home/)
- The tabs that you will look at are **Overview, Active Users, Sessions, and Custom events**.
- When your request to your Alexa skill is specific enough to go right to an intent and has all the information to process the intent it is called a Full Intent. This intent will start a session and the session will end when the request is over. A single-request session.
- When your request to your skill causes the **LaunchRequest** then you are in conversation mode. The LaunchRequest starts the session and usually a CancelIntent or StopIntent will end it. These sessions can consist of many requests.

For more information about this, see the post: [Make Your Alexa Skill Not Be Rude](https://www.linkedin.com/pulse/make-your-alexa-skill-rude-mark-tucker?trk=pulse_spock-articles)