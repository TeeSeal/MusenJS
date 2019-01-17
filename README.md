# Musen
<p align="center"><a href=https://github.com/TeeSeal/Musen><img src="https://i.imgur.com/WLrEiQB.png" style="width: 100%;"></a></p>
<p align="center">A discord radio bot built with the <a href=https://github.com/1Computer1/discord-akairo>discord-akairo</a> framework.</p>

### Setting up

#### Base
1. `git clone https://github.com/TeeSeal/Musen.git`
2. `cd Musen`

#### Dev

1. `npm i`
2. `mv .env.example .env`
3. Fill the .env file with all necessary values
4. `npm run dev`

#### Prod

1. `npm i --only=prod`
2. Export the environment variables specified in `.env.example` (otherwise they can be specified when running the app)
3. `npm start`
