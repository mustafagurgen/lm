# Library Management

## RDBMS
PostgreSql is used as Relational Database. You can create a PostgreSql Server by following steps:

  - Install Docker Engine

    https://docs.docker.com/engine/install/ (follow instructions)

  - Install PostgreSql with command below;

    docker run --name postgre -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

## ORM (Prisma.io)
Prisma is a modern, open-source ORM (Object-Relational Mapping) tool that allows you operate database processes.

  - All database table models defined in schema.prisma file which is under prisma folder.
  - Prisma CLI is used to generate database schema and client code.
  - You can run DDL scripts with "npx prisma migrate dev" command to create database tables.


## Environment Options
  All environment settings are defined in .env files. There is a sample .env.sample file.

  You can copy it to .env file and fill in your own values.


## Running Up Server

  NodeJs version 20^ should be used.


  You can clone the repository with github link below.

    https://github.com/mustafagurgen/lm.git


  You can run server with command below.

    node server.js

  Note: You can install pm2 service to run server.js as server with command below.

    npm install pm2 -g

  After installing pm2 you can run server.js as service with pm2 commands.

    Run as service
    pm2 start server.js

    Check service with logs
    pm2 logs server

    Check Running Services
    pm2 list
