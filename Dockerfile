FROM nginx:alpine

# Copiar todos los archivos de la presentación al directorio de nginx
COPY index.html /usr/share/nginx/html/
COPY style_v4.css /usr/share/nginx/html/
COPY script_v4.js /usr/share/nginx/html/

# Exponer el puerto 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
