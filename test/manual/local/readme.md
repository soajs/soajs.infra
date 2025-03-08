
kubectl apply -f namespace.yaml 
kubectl get ns

kubectl apply -f deployment.yaml -n soajstest
kubectl get pods -n soajstest
kubectl -n soajstest exec --stdin --tty test-v1-bcc755ddd-wkh4q  -- /bin/bash

kubectl logs -f test-v1-bcc755ddd-wkh4q -n soajstest

kubectl describe pod test-v1-bcc755ddd-wkh4q  -n soajstest

kubectl get deployments -n soajstest
kubectl delete deployment -n soajstest


node:22.14.0-slim 
node:22.14.0-alpine
node:22.14.0-bookworm-slim