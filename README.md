# Getting Started with Order Management System(Back end)

 -API CRUD (Create, Read, Update, Delete) for Order Management System with Nest.js and Postgresql
 
 -Authentication with JWT
## Available Scripts

In the project directory, you can run:

### `npm run start:dev`

## Environment variables example

### `PORT=3000`
### `DB_HOST=localhost`
### `DB_PORT=5432`
### `DB_USER=postgres`
### `DB_PASS=postgres`
### `DB_NAME=order_management`
### `REACT_APP_API_VERSION=v1`
### `JWT_SECRET=sH3@4G*bhCX^WCct9$XjG@u&VQRtVIv*AbI2*4krcnQh9HsEDw$fdu!BzJVzL`
### `JWT_USERNAME=testuserhCX^WCc`
### `JWT_PASSWORD=password4krcnQh9HsEDw$fdu!BzJVzL`
### `JWT_ID=1`

## Database Schema

Below is the SQL schema for the Order Management System.

    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE order_items (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id) ON DELETE CASCADE,
        product_name VARCHAR(255) NOT NULL,
        quantity INT CHECK (quantity > 0) NOT NULL,
        price DECIMAL(10,2) NOT NULL
    );


## Contact me

- [LinkedIn](https://www.linkedin.com/in/suchanon-jaiwang-3b3606232/).

