# Currency converter

This is a simple currency converter application that allows users to convert currencies from one to another using
Monobank exchange rates.

## Getting Started

These instructions will guide you on how to set up and run the project on your local machine.

### Prerequisites

- Docker: Ensure you have Docker installed on your machine.

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Leocete/currency-converter.git
```

2. Navigate to the project directory

```bash
cd [project-directory]
```

3. Create a .env file (you can copy the .env.local file and rename it to .env) and update the environment variables if
   needed


4. Build the Docker containers:

```bash
docker-compose build
```

5. Start the Docker containers:

```bash
docker-compose up
```

6. The API should now be running. You can access it at http://localhost:3000.

## Testing the /currency/convert Endpoint

You can test the /currency/convert endpoint using an API testing tool like curl or Postman.

### Example using curl:

```bash
curl -X POST \
http://localhost:3000/currency/convert \
-H 'Content-Type: application/json' \
-d '{
"source": 840,
"target": 980,
"amount": 100
}'
```

Replace the payload with your desired values.

## Stopping the Project

To stop the project, run the following command:

```bash
docker-compose down
```

This will stop and remove the Docker containers.

## Running the tests

To run the tests, run the following command:

```bash
docker-compose run --rm api npm test
```
