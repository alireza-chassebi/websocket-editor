# Websocket Editor

---

Websocket editor is website that allows teams to edit the same rich text editor simultaneously.

   <br />

## Prerequisites

---

Brefore you begin, ensure you have met the following requirements:

- You have [Docker](https://www.docker.com/) installed

   <br />

## Installing Websocket Editor

---

To install Websocket Editor, do the following:

```
  git clone https://github.com/alireza-chassebi/websocket-editor
```

   <br />

## Running Websocket Editor

---

To run the development app, do the following:

1. navigate to the projects root directory

2. setup and run containers

```
  docker-compose up
```

3. go to localhost:3000 in your browser

To run the production app, do the following:

1. navigate to the projects root directory

2. build app docker image

```
  docker build -t prodImage .
```

3. create docker container and start the container

```
  docker run --name prodApp -e NODE_ENV=production -p 4000:4000 prodImage
```

4. go to localhost:4000 in your browser

   <br />

## Teardown of Websocket Editor

---

To teardown the development app, do the following:

1. navigate to the projects root directory

2. stop and remove containers

```
  docker-compose down
```

To teardown the production app do the following:

1. navigate to the projects root directory

2. stop and remove containers

```
  docker rm -f prodApp
```

   <br />
  
## Preview

![](websocket-editor.gif)
