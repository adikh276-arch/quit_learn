FROM nginx:stable-alpine

# Create subpath and copy files
RUN mkdir -p /usr/share/nginx/html/quit_learn
COPY . /usr/share/nginx/html/quit_learn/

# Configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
