BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[lobbies] ADD [current_question_idx] INT,
[question_started_at] DATETIME2;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
