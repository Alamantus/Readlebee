# Readlebee

---

## ⚠ This project is [no longer maintained](https://floss.social/@Readlebee/108408389047896535) ⚠

If you are interested in taking over Readlebee's development and Mastodon account, please contact Robbie Antenesse ([@robbie@antenesse.ml](https://antenesse.ml/profile/robbie)) via an account in [the Fediverse](https://the-federation.info)!

---

[![Read our Contribution Guidelines](https://badges.frapsoft.com/os/v1/open-source.svg?v=102)](./CONTRIBUTING.md)

An attempt at a viable alternative to Goodreads

## Important Links

- [Project Scope](https://gitlab.com/Alamantus/Readlebee/wikis/Project-Scope)
  - Features we feel are essential to the project. Anything beyond the scope should be discussed for later and not prioritized.
- [Dependencies Stack](https://gitlab.com/Alamantus/Readlebee/wikis/Dependencies-Stack)
  - A list of dependencies used in the project and a short explanation of what each of them are for.
- [Contribution Guidelines](./CONTRIBUTING.md)
  - Subject to change but important to follow. Includes a basic code of conduct.
- [Project chat via Gitter](https://gitter.io/Readlebee)
  - Real-time discussion about the project.
- [Issue Tracker](https://gitlab.com/Alamantus/Readlebee/issues)
  - For adding and tracking feature requests, feedback, and bug reports.
- [Main Repo on GitLab](https://gitlab.com/Alamantus/Readlebee)
  - Where all changes are made "official".
- [Mirror Repo on GitHub](https://github.com/Alamantus/Readlebee)
  - Gets changes from GitLab pushed to it so people who prefer GitHub can contribute there as well. Pull requests and issues created here will also be addressed.

## Development

### Requirements

- [Git](https://git-scm.com/)
- [NodeJS 10.16.x](https://nodejs.org/)
- [PostgreSQL 11](https://www.postgresql.org/download/)
  - See the following articles for guidance on how to install it:
    - Windows: http://www.postgresqltutorial.com/install-postgresql/
    - Ubuntu: https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-on-ubuntu-18-04
      - Be sure you set up an account for a readlebee database and [set a password for the account](https://stackoverflow.com/a/12721095)
  - I plan to write up a tutorial on how to get this set up in the wiki at some point soon by combining these links

### Installation

To develop, you'll need to know how to use a terminal or shell on your computer.

Clone the repo to your computer with [Git](https://git-scm.com/) by running:

```
git clone https://gitlab.com/Alamantus/Readlebee.git
```

Then run use [Yarn](https://yarnpkg.com) to install the dependencies:

```
yarn
```

Alternatively, you can use the NPM that's included with Node:

```
npm install
```

Once installed, make sure that the images are processed from their original form:

```
npm run process-images
```

Finally, copy the `config.example.json` files in `app/` and `server/` folders into a new `config.json` file in each.
These config files are not saved to the project, so you can put your server/database info in there safely.

## Usage

After everything's installed, run the "dev" NPM script to build and watch the front end and run the back end:

```
npm run dev
```

Then use your browser to navigate to http://localhost:3000 to view the website.

When you make a change, you need to stop the server with `Ctrl+C` and re-run the script.

It's early days, so this segment will definitely change later as the project gets more complex.

---

## Production

This is totally not yet ready, but I want to use this space to block out what how I would like the installation process
to go for people installing the app.

### Requirements

- NodeJS v8.14+
- NPM v6.4.1+
- NGINX
- PostgreSQL 11+

### Recommendations

- Use a Debian 9 server for stability. Ubuntu should also work just fine.
- Use the default apt packages for the requirements
- Use Git to download the project for installation and easy upgrading

### Installation

Here's a step-by-step installation process so you can get a grasp of what you need to do from a brand new
Debian 9 installation (not included in steps). Ubuntu installation should be more or less exactly the same.

#### Step 1: Install Requirements

Install the requirements with the following commands (note: you may need to use `sudo` for each of these commands):

```
sudo apt update
sudo apt install nodejs nginx postgres-11
```

And optionally (but recommended):
```
sudo apt install git
```

Follow any instructions during each of the installations to get the programs set up correctly.

NGINX may require additional setup, so check through [this page](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-debian-9) for different things that might be good to do.

PostgreSQL will need a database created, so do that and make a user that can access it that's not the root user.

#### Step 2: Download the Project

You can set up the project folder in any location on your server, but these instructions will set it up in
the current user's home folder using Git like so:

```
cd ~
git clone https://gitlab.com/Alamantus/Readlebee.git && cd Readlebee
```

This will download the entire project source code into a `Readlebee` folder.

#### Step 3: Configure the Project

Next, There are some configurations you need to set up. Rename the `config.example.json` to `config.json` like so:

```
mv config.example.json config.json
```

And edit its contents with the correct data for your server using your text editor of choice. Here is what
the `config.example.json` looks like with some explanations of each field:

```
{
  "port": 3000  # the port that the server will serve the app from.
  "dbhost": "localhost" # Where the postgres server is
  "dbport": 5432  # What port the postgres server uses
  "dbname": "Readlebee"  # The name of the database Readlebee will use to make tables and store data in
  "dbuser": "root"  # The username with access to your postgres database
  "dbpass": "password"  # The password for the username above
  ... # more to come
}
```

#### Step 4: Install the Project

You will then need to install the project.

```
sudo npm install
```

This will install all of the dependencies, compile all of the Sass into usable CSS, set up the database and tables in PostgreSQL,
and do any other things that need to be done to get the project set up and usable.

#### Step 5: Run it!

Run the following to start the server:

```
sudo npm start
```

Then it'll be running on your server's localhost at the port you specified in the config!

#### Step 6: Set up an NGINX reverse proxy

Set up a reverse proxy to your localhost:proxy. This'll have to get filled in later.
