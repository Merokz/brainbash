BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[quizzes] ADD [parent_quiz_id] INT,
[version] INT NOT NULL CONSTRAINT [quizzes_version_df] DEFAULT 1;

-- AddForeignKey
ALTER TABLE [dbo].[quizzes] ADD CONSTRAINT [quizzes_parent_quiz_id_fkey] FOREIGN KEY ([parent_quiz_id]) REFERENCES [dbo].[quizzes]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
