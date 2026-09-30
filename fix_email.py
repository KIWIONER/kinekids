import os

path = "uis/frontend/app/api/webhooks/stripe/route.ts"
with open(path, "r") as f:
    content = f.read()

content = content.replace('email: billing?.email || paymentIntent.receipt_email || "",', 'email: billing?.email || paymentIntent.receipt_email || "cliente@kinekids.com",')

with open(path, "w") as f:
    f.write(content)
print("Webhook email fallback applied.")
