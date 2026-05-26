# SnippetFy

A web application to store and organize your development code snippets.

![SnippetFy Preview](/support/screen1.png)

## Features

- Create and manage code snippets
- Organize snippets by categories
- Edit and remove snippets
- User authentication system
- Clean and intuitive interface

## Getting Started

### Prerequisites

- Docker and Docker Compose installed on your machine

### Installation

1. Clone the repository
2. Start the Docker containers:

```sh
docker-compose up -d
```

3. Access the server container and set up the application:

```bash
# Enter the container
docker-compose exec server bash

# Install dependencies
npm install

# Run database migrations
node_modules/.bin/sequelize db:migrate

# Seed initial data
node_modules/.bin/sequelize db:seed:all

# Start development server
npm run dev
```

### Default Access

You can login with the following credentials:

- Email: testeuser@mail.com
- Password: 123456

## License

This project is open source and available under the [MIT License](LICENSE).
