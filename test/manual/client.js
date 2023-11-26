/* eslint no-console:0 */
//
// Create an API client using basic auth
//
const Client = require('kubernetes-client').Client;
const Request = require('kubernetes-client/backends/request');
const swagger = require('../../driver/kubernetes/swagger/swagger-1.22.json');
const client = new Client({
	backend: new Request({
		// local
		"url": "https://kubernetes.docker.internal:6443",
		"auth": {
			// local
			"bearer": "eyJhbGciOiJSUzI1NiIsImtpZCI6InJaSDRhWkY1Y1MxRjVOY3dFaEg1dXk2MjJpUE5RUnZST3NodWxKa2x4UzQifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJkZWZhdWx0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6InNvYWpzLXNlcnZpY2UtYWNjb3VudCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50Lm5hbWUiOiJzb2Fqcy1zZXJ2aWNlLWFjY291bnQiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiI4NjkxYjlhMS00OWI4LTQ3Y2EtODFiYS1jZTA5OGRkOThjN2YiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6ZGVmYXVsdDpzb2Fqcy1zZXJ2aWNlLWFjY291bnQifQ.L01hKAn5VZZcYhIk2a9aeXgGdDLjYnOO_4zVxyDfDA52qapKcjhQaFdl6nUxQi5F-NFnF9uUmPrrG60REZleJ9jSHKh0Ey3BQhI7WZ-A6B7uep9qSHA1gD6mjbR8GPurKZY5eKsf6yWPTW1qICQrvIVP3GfMbaAkwuv8S_K5cNX-8irhDGF3-aW-waBzw7okM8LRxIkxTTe2bt-9ypR3y-YGFA8kwCqz9AvfHi68AiCtLwBH2YfIl8wzXwibvhO2RtoRWt3oz2lxifLGFVIVxzmGbNQM9_t5KnqSFJnPe9KMwNFErKzFa1SquW89k60Atq306n1SwukdrppMSgDc5Q"
		},
		insecureSkipTlsVerify: true
	}),
	//version: '1.13'
	spec: swagger
});
module.exports = {
	client
};