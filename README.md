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

DATABASE_URL = "sqlserver://10.3.35.140:14330;initial catalog=brainbash;user=test;password=Lab335;encrypt=true;trustServerCertificate=true;connection timeout=30"
JWT_SECRET = "sfJ8#29vkd!7dmslWm2r9fPzL@3vZ!z8nXe#2LdPv^qSm8pC"
BASE_URL = "http://10.3.35.110:3000"


blockwochentimmy@gmail.com
dioadai1290@da;.dawd1

colors:
#172D53, #AE0600

toast usage: 

import { showToast } from "@/lib/sonner"

showToast("changes saved successfully!", true)
