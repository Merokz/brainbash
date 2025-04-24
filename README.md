## Setup

```shell
npm install prisma --save-dev --force
npm install @prisma/client --force

npx prisma generate
npx prisma migrate dev --name init

npx prisma db pull
npx prisma migrate resolve --applied 0_init
```

## Environment

Set the env variables in the `.env` file to the respective ones from the `.env.example`