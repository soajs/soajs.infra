/* eslint no-console:0 */
//
// Create an API client using basic auth
//
const Client = require('kubernetes-client').Client;
const Request = require('kubernetes-client/backends/request');
const swagger = require('../../driver/kubernetes/swagger/swagger.json');
const client = new Client({
	backend: new Request({
		// local
		"url": "https://kubernetes.docker.internal:6443",
		"auth": {
			// local
			"bearer": "eyJhbGciOiJSUzI1NiIsImtpZCI6InJ0bG1LZUZ3dXItdkRKeGtPenZfT0MwZXQwbTJDN0QyM0lsSUdrNklwalEifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJkZWZhdWx0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6ImRlZmF1bHQtdG9rZW4td2p0aDgiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC5uYW1lIjoiZGVmYXVsdCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6ImI0ZDVlMjM0LWVkMWEtNDE5OC1iNWJiLTYyNDUyMjI5NTcyMyIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDpkZWZhdWx0OmRlZmF1bHQifQ.OKg-EK7cZtPVfOhvhxZhsq9pQUN1bZpWFUGbb50Ph7eMp5YqLsUrydRCp1rJ23Ns3fTsc4jcQlxRCV7rkzjryv4weV5eDF-KZoJ8aRa0HVF67GH3hC_xYpgHmkGzVgkK_KohO1xhewzy0b5OVEWjzrD-HCVQ9cNBBI88uWcVVtoLAFXomDpAwvUi9LmbDFBfnxTUgYVa4aOf7bfhgKD47gEKWxPC0Uzgfy8S9ruEmf0aQ2wgDZhrPpnvrco93334mGiGIQIlArrNiUVDlieBfKMvlCzil0ZtFWqT8Pg3CWGdccxhAS39AkvHUiW2HvpSVkT8E1yU-ukUATjXVBr6vg"
		},
		insecureSkipTlsVerify: true
	}),
	//version: '1.13'
	spec: swagger
});
module.exports = {
	client
};