BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[participant_answers] ADD [points] INT NOT NULL CONSTRAINT [participant_answers_points_df] DEFAULT 0;

-- AlterTable
ALTER TABLE [dbo].[users] ADD [avatar_url] NVARCHAR(1000);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
