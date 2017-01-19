# SETUP-NODE
Hi friends! This guide is *supposed* to help Matt and Kiera setup node servers on their computers so they can see their work appear on a website as they work.

## For Matt - and any other Mac User - I think

This is for macs. I think Windows has a much more involved setup for all of this, but Mac has XCode and Homebrew that makes everything really simple to install!

### Terminal/Bash + Code Editors

I prefer to use [iTerm 2](https://www.iterm2.com/) as a nice terminal program over the regular terminal console, and I prefer to use [Atom.io](https://atom.io/) as a nice coding environment, since it's fast on macs and its pretty customizable. It has a git-diff package and a jade-reader package that will become more useful as our project continues.

### Download XCode and Brew

You're going to need 2 important programs on your computer - if you've coded before, you've probably installed these. But just in case, check the links to make sure you have.
 * [XCode](https://developer.apple.com/xcode/) - gives a lot of nice developer tools onto Mac. Most importantly [git](https://git-scm.com/docs/gittutorial).  
 * [Homebrew](http://brew.sh/) - allows you to install virtually any package (or installs the things you need to install the other things). If you're unsure if you have this, open up terminal/iTerm and type `brew *` and see what pops up.

 The second will probably ask for root command and your computer password. It's fine, it won't download viruses onto your computer.

### Install Vital Packages

Homebrew allows you to install some really important things. Here's the list and how you should do it:
 * mongod - This is for MongoDB, our database of choice. You can also consider downloading [Robomongo](https://robomongo.org/) for database management.
 * redis  - This is for redis-server, a powerful caching program. We use it to make our website run faster when it refreshes
 * npm    - This is node, which is what our entire website runs on. Pretty important, don't not run this.

These are the individual commands you should type into terminal/iTerm to download this. Just copy and paste each line without `$` and press enter to run each one:

```
$ brew install mongod
$ brew install redis
$ brew install npm
```

### Learn Terminal Commands + File Setup

You should learn how to use Terminal Commands, especially `cd` and `ls`. I suggest reading [this guide](http://www.digitalcitizen.life/command-prompt-how-use-basic-commands). Helps a lot.

Once you've done that, navigate to a directory you're comfortable putting all of the website files in, probably like your Documents folder or like where you keep your work. Once you're there, you should use `git clone your-repos-url-here` to download the files. 

### Server Setup - Finally

Use `cd` to enter the newly created git repository folder. Run the following commands - without the `$`'s.

```
$ npm update
$ mkdir data
```

This creates a bunch of files, then a blank folder called data. Now, open two more terminal windows, for a total of three. Navigate to the git repo folder in the new two, and run one command in each folder, in this order:

```
$ mongod --dbpath data
$ redis-server
$ npm run dev
```

The first runs a database locally in one terminal window, the second runs a redis server in another window, and the last runs the actual website. Keep in mind that the redis server needs the database, and the website needs both. So if you do these out of order, your terminal will complain at you. If you do these successfully, you shouldn't be able to type in any of those three windows anymore, that's fine.

### Gaze Upon Your Work

In any web browser, go to [localhost:3000](localhost:3000) to see the website! Right now, it's pretty blank.

## Thanks for reading :)

Hope this helps - Kelvin
