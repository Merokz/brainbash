BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[users] (
    [id] INT NOT NULL IDENTITY(1,1),
    [username] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [is_registered] BIT NOT NULL CONSTRAINT [users_is_registered_df] DEFAULT 1,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [users_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [valid] BIT NOT NULL CONSTRAINT [users_valid_df] DEFAULT 1,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [users_username_key] UNIQUE NONCLUSTERED ([username]),
    CONSTRAINT [users_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[quizzes] (
    [id] INT NOT NULL IDENTITY(1,1),
    [title] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [creator_id] INT NOT NULL,
    [is_public] BIT NOT NULL CONSTRAINT [quizzes_is_public_df] DEFAULT 0,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [quizzes_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [valid] BIT NOT NULL CONSTRAINT [quizzes_valid_df] DEFAULT 1,
    CONSTRAINT [quizzes_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[questions] (
    [id] INT NOT NULL IDENTITY(1,1),
    [quiz_id] INT NOT NULL,
    [question_text] NVARCHAR(1000) NOT NULL,
    [image] NVARCHAR(1000),
    [order_num] INT NOT NULL,
    [question_type] NVARCHAR(1000) NOT NULL CONSTRAINT [questions_question_type_df] DEFAULT 'SINGLE_CHOICE',
    [created_at] DATETIME2 NOT NULL CONSTRAINT [questions_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [valid] BIT NOT NULL CONSTRAINT [questions_valid_df] DEFAULT 1,
    CONSTRAINT [questions_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[answers] (
    [id] INT NOT NULL IDENTITY(1,1),
    [question_id] INT NOT NULL,
    [answer_text] NVARCHAR(1000) NOT NULL,
    [is_correct] BIT NOT NULL CONSTRAINT [answers_is_correct_df] DEFAULT 0,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [answers_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [valid] BIT NOT NULL CONSTRAINT [answers_valid_df] DEFAULT 1,
    CONSTRAINT [answers_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[lobbies] (
    [id] INT NOT NULL IDENTITY(1,1),
    [quiz_id] INT NOT NULL,
    [host_id] INT NOT NULL,
    [state] NVARCHAR(1000) NOT NULL CONSTRAINT [lobbies_state_df] DEFAULT 'IN_LOBBY',
    [join_code] NVARCHAR(1000) NOT NULL,
    [time_to_answer] INT NOT NULL CONSTRAINT [lobbies_time_to_answer_df] DEFAULT 30,
    [is_random_order] BIT NOT NULL CONSTRAINT [lobbies_is_random_order_df] DEFAULT 0,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [lobbies_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [valid] BIT NOT NULL CONSTRAINT [lobbies_valid_df] DEFAULT 1,
    CONSTRAINT [lobbies_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [lobbies_join_code_key] UNIQUE NONCLUSTERED ([join_code])
);

-- CreateTable
CREATE TABLE [dbo].[participants] (
    [id] INT NOT NULL IDENTITY(1,1),
    [username] NVARCHAR(1000) NOT NULL,
    [score] INT NOT NULL CONSTRAINT [participants_score_df] DEFAULT 0,
    [user_id] INT,
    [lobby_id] INT NOT NULL,
    [session_token] NVARCHAR(1000) NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [participants_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [valid] BIT NOT NULL CONSTRAINT [participants_valid_df] DEFAULT 1,
    CONSTRAINT [participants_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [participants_session_token_key] UNIQUE NONCLUSTERED ([session_token]),
    CONSTRAINT [participants_lobby_id_username_key] UNIQUE NONCLUSTERED ([lobby_id],[username])
);

-- CreateTable
CREATE TABLE [dbo].[participant_answers] (
    [id] INT NOT NULL IDENTITY(1,1),
    [participant_id] INT NOT NULL,
    [question_id] INT NOT NULL,
    [answer_id] INT,
    [time_to_answer] INT NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [participant_answers_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [valid] BIT NOT NULL CONSTRAINT [participant_answers_valid_df] DEFAULT 1,
    CONSTRAINT [participant_answers_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[quizzes] ADD CONSTRAINT [quizzes_creator_id_fkey] FOREIGN KEY ([creator_id]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[questions] ADD CONSTRAINT [questions_quiz_id_fkey] FOREIGN KEY ([quiz_id]) REFERENCES [dbo].[quizzes]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[answers] ADD CONSTRAINT [answers_question_id_fkey] FOREIGN KEY ([question_id]) REFERENCES [dbo].[questions]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[lobbies] ADD CONSTRAINT [lobbies_quiz_id_fkey] FOREIGN KEY ([quiz_id]) REFERENCES [dbo].[quizzes]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[lobbies] ADD CONSTRAINT [lobbies_host_id_fkey] FOREIGN KEY ([host_id]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[participants] ADD CONSTRAINT [participants_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[participants] ADD CONSTRAINT [participants_lobby_id_fkey] FOREIGN KEY ([lobby_id]) REFERENCES [dbo].[lobbies]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[participant_answers] ADD CONSTRAINT [participant_answers_participant_id_fkey] FOREIGN KEY ([participant_id]) REFERENCES [dbo].[participants]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[participant_answers] ADD CONSTRAINT [participant_answers_question_id_fkey] FOREIGN KEY ([question_id]) REFERENCES [dbo].[questions]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[participant_answers] ADD CONSTRAINT [participant_answers_answer_id_fkey] FOREIGN KEY ([answer_id]) REFERENCES [dbo].[answers]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
