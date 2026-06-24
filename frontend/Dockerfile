FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_URL=
ARG VITE_CLERK_PUBLISHABLE_KEY=
ARG VITE_VAPI_PUBLIC_KEY=
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_VAPI_PUBLIC_KEY=$VITE_VAPI_PUBLIC_KEY

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
