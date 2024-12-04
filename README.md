# tunelink-backend
A node.js with express server

## Folder Structure  

The backend repository is organized as follows:

- **`/config`**: **Unused** Contains configuration files for the application, such as database connections or middleware settings.  
- **`/controllers`**: Houses the logic for handling incoming requests and connecting them to the appropriate services.  
- **`/data`**: Stores test data, including JSON files and other resources, used for populating the database during development or testing.  
- **`/routes`**: Defines the API endpoints for user, post, and other core functionalities.  
- **`/services`**: **Unused** Contains reusable service modules for tasks like database operations or recommendation logic.  
- **`/tests`**: Includes test suites for validating the backend functionality.  
- **`.env.copy`**: A template for environment variables required by the application.  
- **`.gitignore`**: Specifies files and directories to be ignored by Git.  
- **`README.md`**: Documentation for setting up and using the backend.  
- **`app.js`**: Main application file that initializes middleware and sets up the core app logic.  
- **`example.js`**: Example script or utility for demonstrating backend functionality.  
- **`jest.config.js`**: Configuration file for the Jest testing framework.  
- **`package.json`**: Contains project metadata and dependencies.  
- **`server.js`**: Entry point to start the backend server.

## Set up instructions

1. Clone this repository to your work directory
2. Navigate into `tunelink-backend` (this repo) directory
3. Run `npm i`, this will install all required packages for the backend
4. Create a `.env` at root and copy contents of `.env.copy` into there, message on groupchat to get secrets, or remind ozel to email you, or download on provided drive link.
5. download .env from this url `https://drive.google.com/file/d/1CXZcNirtCNC43OU_aRnYcX-yG6y0CEGw/view?usp=sharing`.
5. Remind Ozel to give you access to mongodb, not required but it is helpful, for development purposes.
6. Navigate to `data/`
7. Unzip `test_data.zip`.
8. Remove contents of `test_audio` directory.
9. Go to `https://drive.google.com/drive/folders/1vvtAXnvMvA6ErBT0sbgSsn79shp8YUKL?usp=sharing` to download uncompressed audio files, place them in `test_audio` directory.
10. You can add more files if you want, but should be uncompressed.

You are ready to run the backend

## Run the server

1. After you have set up, run `npm start` to start the server
2. You can navigate to `localhost:3000/health` to check health status of the server

## Routes For Development, developers please read
- `localhost:3000/api-docs`
    - An interactive api documentation page that lists available routes
    - Useful for development
    - The routes to update (PUT) a user does not work on swagger
    - Routes to upload User through swagger does not work
    - Route to upload a post through swagger does not work
    - This is because I need to put more detailed API information to swagger, it is just difficult to do
    - In the meantime I suggest reading tests, to understand what the api expects.

    In short:
    uploadPost expects:
    ```js
    const formData = new FormData();
    formData.append("ownerUser", "83610374183ffc"); // A mongo object if
    formData.append("likesCount", 0);
    formData.append("caption", "Lorem ipsum");
    formData.append("outLinks", JSON.stringify({"youtube": "url", "drive": "url"})); // etc
    formData.append("audio", audioFile); // File is handled by the IO, but basically it must be read to buffer, than you pass in the buffer
    formData.append("albumCover", albumCoverFile); // Same goes

    // and you make the fetch like this
    fetch("/api/upload/uploadPost", {
        method: "POST",
        body: formData
    });
    ```

    uploadUser expects:
    ```js
    const formData = new FormData();
    formData.append("user", JSON.stringify(user)); // the user object should have the required fields, you can see a template of it in the json test data
    formData.append("userAvatar", avatarFile); // Again buffer
    fetch("/api/upload/uploadUser", {
        method: "POST",
        body: formData
    });
    ```

    You can make example requests like these for now

## Populating database
- Make sure you have the test_data, inside data directory
- Run `npm test -- tests/uploadRoutes.test.js` to run tests that will populate the database

## Tests
- Please read the set up instructions, to make sure you have the test data.
- I suggest running test individually, mongo has to drop the database between each run, when they all run together it fails some tests because of not waiting for drop, in individual runs there are no errors.
- Run `npm test -- tests/uploadRoutes.test.js` to run individual test suites defined in `/tests`.
- You can also use Postman for api testing.
