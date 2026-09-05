# SHIFTLY TLS and Ingress Configuration

## Architecture Overview

All Shiftly microservices run in a secure virtual private cloud (VPC) and bind to local ports (e.g., `3001`, `3002`) over plain HTTP.

**TLS termination is strictly handled at the edge.**

The recommended production ingress is an **AWS Application Load Balancer (ALB)** or **Kubernetes NGINX Ingress Controller**, configured to:

1. Terminate SSL/TLS (using AWS ACM or Let's Encrypt certs).
2. Forward the traffic as plain HTTP to the internal `api-gateway`.
3. Inject the `X-Forwarded-For` and `X-Forwarded-Proto` headers.

## Application Configuration

To support this architecture, all NestJS applications have been configured with:

```typescript
app.set('trust proxy', 1);
```

This ensures that the underlying Express instance correctly trusts the first proxy (the ALB or Ingress Controller) and accurately processes the client IP for rate-limiting and security auditing.

## Security Requirements

- **HSTS (HTTP Strict Transport Security):** Must be enabled at the ingress level (e.g., via NGINX annotations or Cloudflare) to force browsers to exclusively use HTTPS.
- **Port Blocking:** No microservice should have its port exposed to the public internet directly. All traffic MUST flow through the `api-gateway` which sits behind the TLS-terminating load balancer.
