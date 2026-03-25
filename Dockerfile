FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Copy everything (all learn folders)
COPY . /usr/share/nginx/html

# Clean default and copy our config
RUN rm /etc/nginx/conf.d/default.conf
COPY vite-nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
