Okay, here is the documentation for your Next.js application based on the provided files.

BrainBash Application Documentation
This document outlines the setup, architecture, database schema, and API endpoints for the BrainBash quiz application.

1. Project Overview
BrainBash is a real-time quiz application built with Next.js. It allows users to create quizzes, host quiz lobbies, and have participants join and compete in real-time.

2. Technology Stack
Framework: Next.js 15
Language: TypeScript
Database: SQL Server (managed via Prisma ORM)
Styling: Tailwind CSS
UI Components: Shadcn/UI
Real-time: Pusher
Authentication: JWT (using jose) and bcrypt for password hashing
Schema Validation: Zod (likely used within form handling, though form components are not provided)
Package Manager: pnpm (implied by pnpm-lock.yaml)
3. Project Structure & Configuration
app/: Contains the core application code, including API routes (app/api/) and likely frontend pages/components (though not fully provided).
lib/: Utility modules for database interactions (db.ts), authentication (auth.ts), Pusher configuration (pusher-service.ts), and general utilities (utils.ts).
prisma/: Prisma schema definition, migrations (migrations/), and generated client.
components/: Reusable UI components, including Shadcn/UI components (components/ui/).
hooks/: Custom React hooks like use-toast.ts.
styles/ / app/globals.css: Global CSS files and Tailwind configuration.
Configuration Files:
next.config.mjs: Next.js configuration.
tailwind.config.ts: Tailwind CSS setup.
tsconfig.json: TypeScript configuration.
package.json: Project dependencies and scripts.
components.json: Shadcn/UI configuration.
4. Database Schema (prisma/migrations/.../migration.sql)
The application uses a SQL Server database with the following main tables:

users: Stores user information (username, email, hashed password).
quizzes: Stores quiz metadata (title, description, creator, public status).
questions: Stores individual questions for each quiz (text, image, type, order).
answers: Stores possible answers for each question (text, correctness).
lobbies: Manages active quiz sessions (quiz ID, host ID, state, join code, settings).
participants: Tracks users (registered or guest) who join a lobby (username, score, session token).
participant_answers: Records the answers submitted by participants during a game.
Relationships are defined using foreign keys (e.g., quizzes.creator_id references users.id). Most tables use a valid boolean flag for soft deletion.

5. Authentication (lib/auth.ts)
User Authentication: Uses JWTs stored in an HTTP-only cookie (auth_token).
Passwords are hashed using bcrypt.
createUserToken generates a 7-day JWT upon successful login/registration.
getUserFromToken verifies the token from the cookie and fetches user data.
Participant Authentication: Uses JWTs passed in the Authorization: Bearer <token> header for actions within a lobby/game.
createParticipantToken generates an 8-hour JWT when a participant joins a lobby.
getParticipantFromToken verifies the token from the header and fetches participant/lobby data.
6. Real-time Communication (lib/pusher-service.ts)
Pusher is used for real-time updates during quiz lobbies and gameplay.
Channels:
presence-lobby-{lobbyId}: Used for lobby events (participant joining/leaving, game start). Requires authentication via /api/pusher/auth to track presence.
private-game-{lobbyId}: Used for game events broadcast to authenticated participants (e.g., question start/end, game end).
public-lobbies: Potentially used for broadcasting updates about newly created public lobbies (though the receiving end isn't shown in the provided files).
Events: Standardized event names (EVENTS) are used (e.g., PARTICIPANT_JOINED, GAME_STARTED, QUESTION_STARTED, ANSWER_SUBMITTED, GAME_ENDED).
Authentication: The /api/pusher/auth endpoint handles authorizing client subscriptions to presence and private channels based on either the user's auth_token cookie or the participant's Authorization header token.
7. API Endpoints (app/api/)
7.1 Authentication (/api/auth/)
POST /api/auth/register: Creates a new user account, hashes the password, creates a JWT, and sets the auth_token cookie.
POST /api/auth/login: Verifies username/email and password, creates a JWT, and sets the auth_token cookie.
POST /api/auth/logout: Deletes the auth_token cookie.
GET /api/auth/me: Returns the currently authenticated user's data based on the auth_token cookie.
7.2 Quizzes (/api/quizzes/)
GET /api/quizzes?type=public: Returns a list of all public quizzes.
GET /api/quizzes?type=user: Returns a list of quizzes created by the authenticated user. (Requires auth).
POST /api/quizzes/create: Creates a new quiz with associated questions and answers. (Requires auth).
GET /api/quizzes/{id}: Fetches details of a specific quiz, including questions and answers. (Requires auth if the quiz is private).
PUT /api/quizzes/{id}: Updates an existing quiz, its questions, and answers. Uses soft deletion for removed items. (Requires auth, user must be creator).
DELETE /api/quizzes/{id}: Soft-deletes a quiz. (Requires auth, user must be creator).
7.3 Lobbies (/api/lobbies/)
POST /api/lobbies: Creates a new lobby for a given quizId. Generates a unique 5-digit joinCode. Triggers Pusher event if public. (Requires auth).
GET /api/lobbies/{id}: Fetches details for a specific lobby ID.
POST /api/lobbies/join: Allows a participant to join a lobby using joinCode and username. Creates a participant record, generates a participant JWT, and returns it. Triggers PARTICIPANT_JOINED Pusher event.
POST /api/lobbies/{id}/start: Changes the lobby state to IN_GAME. Triggers GAME_STARTED Pusher event to the host (with full quiz data) and participants (with answers removed). (Requires auth, user must be host).
POST /api/lobbies/{id}/end: Changes the lobby state to CONCLUDED. Fetches final scores/results. Triggers GAME_ENDED Pusher event with results to host and participants. (Requires auth, user must be host).
POST /api/lobbies/{id}/answer: Records an answer submitted by a participant. Requires participant JWT in Authorization header. Triggers ANSWER_SUBMITTED Pusher event to the host.
7.4 Pusher (/api/pusher/)
POST /api/pusher/auth: Authenticates client requests to subscribe to private/presence Pusher channels based on user or participant tokens.