FROM ubuntu:25.10

ARG _ENV_NAME
ARG _DOMAIN
ARG _TIME_ZONE
ARG _LANG
ARG _SERVER_PORT
ARG _PATH_ROOT
ARG _PATH_CERTIFICATE_PEM
ARG _VERSION_TAG

ENV ENV_NAME=${_ENV_NAME}
ENV DOMAIN=${_DOMAIN}
ENV TZ=${_TIME_ZONE}
ENV LANG=${_LANG}
ENV SERVER_PORT=${_SERVER_PORT}
ENV PATH_ROOT=${_PATH_ROOT}
ENV PATH_CERTIFICATE_PEM=${_PATH_CERTIFICATE_PEM}
ENV VERSION_TAG=${_VERSION_TAG}

ENV DEBIAN_FRONTEND=noninteractive
ENV DEBCONF_NOWARNINGS=yes
ENV SUDO_FORCE_REMOVE=yes
ENV HISTFILE="/home/node/.bash_history"
ENV NODE_OPTIONS=--use-openssl-ca
ENV NODE_EXTRA_CA_CERTS="${PATH_CERTIFICATE_PEM}"
ENV NPM_CONFIG_USERCONFIG="/home/node/.npmrc"

COPY ./certificate/ /usr/local/share/ca-certificates/
COPY ./docker/font/ /usr/share/fonts/truetype/noto/
COPY ./docker/font.conf /etc/fonts/local.conf
COPY ./ ${PATH_ROOT}

RUN cd ~ \
    # No root
    && userdel ubuntu \
    && rm -rf /home/ubuntu/ \
    && groupadd -g 1000 node \
    && useradd -M -u 1000 -g 1000 -d ${PATH_ROOT} -s /bin/bash node \
    && uid="$(id -u node)" \
    && mkdir -p ${PATH_ROOT} /home/node/ /run/user/${uid} /usr/lib/node_modules/npm/ \
    && chown -R node:node ${PATH_ROOT} /home/node/ /run/user/${uid} /usr/lib/node_modules/npm/ \
    && chmod -R 775 ${PATH_ROOT} /home/node/ /usr/lib/node_modules/npm/ \
    && chmod -R 700 /run/user/${uid} \
    # Update
    && echo 'Acquire::Retries "3";' > /etc/apt/apt.conf.d/80-retries \
    && echo 'Acquire::http::No-Cache "true";' > /etc/apt/apt.conf.d/99no-cache \
    && echo 'Acquire::https::No-Cache "true";' >> /etc/apt/apt.conf.d/99no-cache \
    && VERSION_CODENAME=$(grep VERSION_CODENAME= /etc/os-release | cut -d= -f2) \
    && find /usr/local/share/ca-certificates/ -type d -exec chmod 755 {} + \
    && find /usr/local/share/ca-certificates/ -type f -exec chmod 644 {} + \
    && apt-get update && apt-get install -y ca-certificates tzdata curl media-types jq gettext-base \
    && update-ca-certificates \
    && ln -sf /usr/share/zoneinfo/${TZ} /etc/localtime && echo ${TZ} > /etc/timezone \
    && echo "text/typescript ts" >> /etc/mime.types \
    # NodeJs
    && curl -fsSL https://deb.nodesource.com/setup_24.x | bash - \
    && apt-get update && apt-get install -y \
    nodejs \
    && npm install -g npm@12.0.2 \
    && if [ -d /usr/lib/node_modules/npm/node_modules/brace-expansion/ ]; then \
    rm -rf /usr/lib/node_modules/npm/node_modules/brace-expansion/; \
    mkdir -p /usr/lib/node_modules/npm/node_modules/brace-expansion/; \
    curl -fsSL https://registry.npmjs.org/brace-expansion/-/brace-expansion-5.0.9.tgz | tar -xz --strip-components=1 -C /usr/lib/node_modules/npm/node_modules/brace-expansion/; \
    fi \
    && if [ -d /usr/lib/node_modules/npm/node_modules/tar/ ]; then \
    rm -rf /usr/lib/node_modules/npm/node_modules/tar/; \
    mkdir -p /usr/lib/node_modules/npm/node_modules/tar/; \
    curl -fsSL https://registry.npmjs.org/tar/-/tar-7.5.21.tgz | tar -xz --strip-components=1 -C /usr/lib/node_modules/npm/node_modules/tar/; \
    fi \
    && if [ -d /usr/lib/node_modules/npm/node_modules/ip-address/ ]; then \
    rm -rf /usr/lib/node_modules/npm/node_modules/ip-address/; \
    mkdir -p /usr/lib/node_modules/npm/node_modules/ip-address/; \
    curl -fsSL https://registry.npmjs.org/ip-address/-/ip-address-10.3.1.tgz | tar -xz --strip-components=1 -C /usr/lib/node_modules/npm/node_modules/ip-address/; \
    fi \
    && if [ -d /usr/lib/node_modules/npm/node_modules/undici/ ]; then \
    rm -rf /usr/lib/node_modules/npm/node_modules/undici/; \
    mkdir -p /usr/lib/node_modules/npm/node_modules/undici/; \
    curl -fsSL https://registry.npmjs.org/undici/-/undici-6.28.0.tgz | tar -xz --strip-components=1 -C /usr/lib/node_modules/npm/node_modules/undici/; \
    fi \
    # Trivy
    && curl -fsSL https://github.com/aquasecurity/trivy/releases/download/v0.72.0/trivy_0.72.0_Linux-64bit.deb -o /home/app/trivy_0.72.0_Linux-64bit.deb \
    && dpkg -i /home/app/trivy_0.72.0_Linux-64bit.deb \
    # Upgrade
    && apt-get update \
    && apt-get upgrade -y \
    # Clean
    && apt-get remove --purge -y sudo \
    && apt-get clean -y \
    && apt-get autoclean -y \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

USER node

WORKDIR ${PATH_ROOT}

RUN \
    # Npm
    bash ${PATH_ROOT}script/npm.sh "build"

CMD ["sh", "-c", "bash ${PATH_ROOT}script/trivy.sh && bash ${PATH_ROOT}script/nodejs.sh"]

EXPOSE ${SERVER_PORT}
