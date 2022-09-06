# Ticketing Node Microservice + Kubernetes project

A learning project of ecommerce ticketing website builded with an architecture of Microservices, running inside a Kubernetes Cluster

## How to run

There is a couple of steps to run this project:

1. Install **Docker** and enable **Kubernetes** Cluster
2. Install the dependencies for each project
3. To run locally and get access to the cluster, you have to configure a load balancer like ingress-nginx inside your Kubernetes cluster, you can do that by following the steps on this guide https://kubernetes.github.io/ingress-nginx/deploy/#quick-start
4. Next, you have to config some secret keys that will be used as environment variables to some services, you can do that by running:

```
kubectl create secret generic <name> --from-literal=<key>=<value>
```

The list of secrets needed for the system to work is:
  - **name**: postgres, **key**: POSTGRES_PSW
  - **name**: jwt-secret, **key**: JWT_KEY
5. To run all the config files inside the infra/k8s directory, you need to install skaffold on the root of your project and add it to your bin path, you can do that by following the steps on this guide https://skaffold.dev/docs/install, then with skaffold successfully installed, type:

```
skaffold dev
```

6. Now, with every service up and running, to actually access the client service inside of the Kubernetes Cluster, you need to do a last config on the hosts file inside your local machine, to do so:

Windows (C:\Windows\System32\Drivers\etc\hosts) <br>
Linux (/etc/hosts)

```
OPEN THE hosts FILE
ON THE LAST LINE, TYPE: 127.0.0.1 ticketing.dev
SAVE AND CLOSE THE FILE
```

7. Then, open your browser and type *ticketing.dev* on the address bar, you gonna fall into a security warning (only development), to bypass that, type *thisisunsafe* on the browser, then you will get the client home page.

## Testing

1. Each nest project has it's unique set of tests detailed on the README.md file inside each.
2. To run nats-test project, you need to initialize the skaffold to run our config files, then you need to port forward the nats pod into your local machine, to do so, type:

```
kubectl port-forward <nats-pod-name> 4222:4222
```