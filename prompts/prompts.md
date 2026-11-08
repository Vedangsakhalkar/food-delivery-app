# Prompts Used in the Training


## Getting the machine ready for front-end app

Give me all that I must have installed on my machine for an application that is based on  " : nextjs, tailwind, shadcn ui components.


## Getting Start with Front-End App

Help me to seed a new application in the current folder : nextjs, tailwind, shadcn ui components.  setup the project and the dependencies accordingly



## Login Page

This app must start with the login page. Design and implement a login page which will except user name and password and also will have the option for the user to "forgot password". Use shadcn components including the button. And design it elegantly as per modern standards

## Branch rule prompt that would add to CLAUDE.md

I want you to update @CLAUDE.md  with the following branching rules. Every new task (started with the new claude chat / context) must end up creating the new feature branch from release/dev.



## Mock screens prompt

Refer to the /Users/shakir/trainings/food-delivery-app/project-docs file and design the mock user interface end to end for each possibsle screen for the entire app for me to review. 


## Architecture Prompt

Refer to /food-delivery-app/project-docs files and give me architecture.md file



## Story management rules prompt

I want you to create a story file for each story in Epic 1 such that it follows the typical format of user story as per agile software develpoment standards. 

Also create one single stories.yaml with the details of each story (include stories of all epics) and it must maintain state  of each story as it is built : when you start a story to build creating a new branch then set it in-progress, (to start with all stories will be 'ready-for-dev'), then - as you open pr set the state to review and when the story is reviewed , issues resolved and merged - set the state to done.

Always create story files in project-docs/stories folder

The name of story file must follow kebab style for e.g story-us-1.1-sign-up-with-role

Update the CLAUDE.md file of this project to make sure that the aforementioned rules and concepts of story management is always followed

I repeat : for now - create user story files only for epic 1 and later when I ask : ony then create story files for other epics

