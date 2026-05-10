# Ms_security_scan
Microservice security scan.

Depend on "Ms_cronjob" (use "ms_cronjob-volume" to share the certificate).

It's possible to use a custom certificate instead of self‑signed.
Just add it to the "/certificate/custom/" folder and change the env variable before build the container.

## Info:
- Cross platform (Windows, Linux)
- Trivy

## Installation
1. For build and up write on terminal:
```
bash docker/container_execute.sh "local" "build-up"
```

2. Just for up write on terminal:
```
bash docker/container_execute.sh "local" "up"
```

## Reset
1. Delete this from the root:
    - .cache
    - .config
    - .local
    - .npm
    - .pki
    - .venv
    - dist
    - node_modules
    - package-lock.json

2. Follow the "Installation" instructions.

## Api (Postman)
1. Info
```
url = https://localhost:1048/info
method = GET
```

2. Login
```
url = https://localhost:1048/login
method = GET
```

3. Check
```
url = https://localhost:1048/api/check
method = POST

json

key             value
---             ---
"mode"          "image" (Or "repository")
"target"        "cimo001/ms_cronjob:1.0.0" (Or git url when use "repository" mode.)
```

4. Logout
```
url = https://localhost:1048/logout
method = GET
```
