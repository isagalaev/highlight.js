FROM node:12
# docker build -t highlight-js .
RUN apt-get update && apt-get install -y nginx
WORKDIR /var/www/html
COPY . /var/www/html
RUN npm install && \
    node tools/build.js :common
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
