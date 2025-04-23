npm install prisma --save-dev --force
 npm install @prisma/client --force   
 npx prisma generate         
 npx prisma migrate dev --name init   
 ---
 npx prisma db pull
 npx prisma migrate resolve --applied 0_init            
 ---
 
DATABASE_URL = "sqlserver://10.3.35.140:14330;initial catalog=brainbash;user=test;password=Lab335;encrypt=true;trustServerCertificate=true;connection timeout=30"
 in die .env file