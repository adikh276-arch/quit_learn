FROM nginx:stable-alpine

# Create the subpath directory and copy files there
RUN mkdir -p /usr/share/nginx/html/quit_learn
COPY . /usr/share/nginx/html/quit_learn

# Copy the nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
