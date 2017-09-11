# packhack

The SMS bot for family co-ordination.  Avoid the nags with this family list and reminder text bot that every member can participate in.
No need to download apps and of course works when the young ones have limited and cheaper phones.

Basically as an always busy, dual working household this filled a need.

# try it with your family now
Email me (nichoalsgmcconnell@gmail.com) to add your family to the base installation.  Let me know names, phone numbers, default timezone.
Free for now.

# how to use
Firstly, you should get a text intro when you join.  Add the phone number to your contacts as **packhack**
- **packhack** for help
- **get lists** to see current lists or simple **lists**
- **create [list]** to create a new list
- **delete [list]** to delete a new list
- **get [list]** to see items in a particular list or simply type **[list]**
- **add [item(s)]** to add item(s) to the list last used (separate items by double spaces, commas or periods)
- **remove [item(s)]** to remove item(s) to the list last used
  - Use **edit [list]** if you want to use list item numbers for removing by number rather than the list item text.  You can then say **remove 1,2,3**
- **send [person] [list]** to send a person a list immediately
- **remind [person] [when] [what]** to set up reminders.
  - [when] can be 10am, noon, tomorrow afternoon, next week, thursday, wednesday morning, 10/1/2018
  - [what] is generally just the message but if you want to add a list too use #list
- **get reminders** to see all the family's up-coming reminders

Note: [person] could be the name of the person or "all" or "me"

# tech
- Uses node making heavy use of promises
- Main structural split:
  - **Language Processor** to process the text message itself without any data context
  - **Text Processor** to process the language and perform data operations
  - **Model** separated out into a DB-agnostic layer which calls the mongoDB specific layer
- Uses TDD, extensively tested (260+ tests)

# what you need to get it running on a separate install?
1. Server to run node (eg Heroku etc)
1. Twilio account with SMS phone number
1. MongoDB with lists, listitems and familymember collections (see model/monogo.js for structure)
1. Deploy to node with the following environment keys to connect Twilio and Mongo accounts etc
  - TWILIO_ACCOUNT_SID
  - TWILIO_AUTH_TOKEN
  - TWILIO_NUMBER
  - MONGODB_URI
  - LOG_LEVEL (info, debug etc)
  - LOG_DEPTH (object logging depth)

# next steps
- Send also allows message to be sent, not just list (like reminders)
- Better auto-detection of list with the remind command so don't have to use hash
- Done/undo capability
- Set/view timezone
- View family members
- Auto-categorization of groceries for shopping lists (smartly split out into fruit&veg, meats, frozen, diary, bakery etc)
- Improved on-boarding (a little manual right now)
