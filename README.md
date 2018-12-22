# PWA Christmas
<p align="center"><img src="https://scontent.fsgn1-1.fna.fbcdn.net/v/t1.0-9/48407137_1139274289568031_3613062420815151104_o.jpg?_nc_cat=104&_nc_ht=scontent.fsgn1-1.fna&oh=07e785861d51f5f3dfd2b1c915b46816&oe=5CD63A7D" width="800" /></p>

## Overview

* **Easiest way to run a node server:** Sensible defaults & includes everything you need with minimal setup.

`pwa-christmas` is based on the following libraries & tools:

* [`express`](https://github.com/expressjs/express)/[`mysql`](http://docs.sequelizejs.com): Performant, extensible web server framework

## Features

* PWA
* Notification
* Offline
* Install Homescreen
* Responsive Mobile
* Runs everywhere: Can be deployed via `now`, `up`, AWS Lambda, Heroku etc.


## Getting Started
***
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

- Install **Node LTS 8** 
  - Download: https://nodejs.org/en/download/


### Installation

  Install yarn as global packages if not ``` npm install -g yarn```
```
    yarn install
```
*You can use npm. But I recommend usage yarn instead of npm*

### Usage
***

```
  yarn start || npm start
```

Server will start with port http://localhost:8080

```
  npm build || npm build
```

Server will start with port http://localhost:4500 and environment NODE_ENV is development with **yarn dev** or production with **yarn production**

> By default application will run with environment **development**. If you want to specify environment, ex: **testEnvironment**. You modify on folder **scripts** part of **package.json** file as below:
>  - **Current**: ``` "dev": "cross-env NODE_ENV=development nodemon --exec babel-node src/index.js", ```  
>
>  - **Change to**: ``` "dev": "cross-env NODE_ENV=testEnvironment nodemon --exec babel-node src/index.js", ```

 
    
#### Running the tests ||  Scan ESlint issues

### `up` (Coming soon 🔜 )

## Deployment

### Heroku

To deploy your application server with [Heroku](https://heroku.com), follow these instructions:

1.  Download and install the [Heroku Command Line Interface](https://devcenter.heroku.com/articles/heroku-cli#download-and-install) (previously Heroku Toolbelt)
2.  Log in to the Heroku CLI with `heroku login`
3.  Navigate to the root directory of your `app` server
4.  Create the Heroku instance by executing `heroku create`
5.  Deploy your app server by executing `git push heroku master`

### `up` (Coming soon 🔜 )

### AWS Lambda (Coming soon 🔜 )

## Help & Community

Join me. if you run into issues or have questions. I love talking to you!

<p align="center"><a href="https://oss.prisma.io"><img src="https://imgur.com/IMU2ERq.png" alt="Prisma" height="240px"></a></p>
